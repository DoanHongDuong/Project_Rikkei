const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const ExtensionRequest = require('../models/ExtensionRequest');
const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const TaskHistory = require('../models/TaskHistory');

class ExtensionService {
    /**
     * Gửi yêu cầu gia hạn deadline cho công việc được giao
     * @param {Object} data 
     * @param {number} data.taskId - ID công việc
     * @param {string} data.requestedDeadline - Hạn hoàn thành mới mong muốn (YYYY-MM-DD)
     * @param {string} data.reason - Lý do xin gia hạn
     * @param {number} requesterId - ID người gửi yêu cầu (Member được giao task)
     * @returns {Promise<Object>} Yêu cầu gia hạn vừa tạo
     */
    async createRequest({ taskId, requestedDeadline, reason }, requesterId) {
        // 1. Kiểm tra đầu vào hợp lệ
        if (!taskId) {
            throw this.createError('Task ID là bắt buộc.', 400);
        }
        if (!requestedDeadline) {
            throw this.createError('Hạn hoàn thành mới là bắt buộc.', 400);
        }
        if (isNaN(Date.parse(requestedDeadline))) {
            throw this.createError('Hạn hoàn thành mới không đúng định dạng ngày.', 400);
        }
        if (!reason || reason.trim() === '') {
            throw this.createError('Lý do gia hạn là bắt buộc.', 400);
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (new Date(requestedDeadline) < now) {
            throw this.createError('Hạn hoàn thành mới không được ở trong quá khứ.', 400);
        }

        // Bắt đầu transaction và sử dụng khóa để tránh race condition khi tạo request đồng thời
        const transaction = await sequelize.transaction();
        try {
            // Khóa dòng task bằng LOCK.UPDATE để đồng bộ hóa
            const task = await Task.findByPk(taskId, {
                lock: transaction.LOCK.UPDATE,
                transaction,
                include: [{ model: Project, as: 'project' }]
            });

            if (!task) {
                throw this.createError('Không tìm thấy công việc.', 404);
            }
            if (task.is_deleted) {
                throw this.createError('Công việc đã bị xóa.', 400);
            }

            // 3. Kiểm tra xem người yêu cầu có đúng là người được giao task hay không
            if (!task.assignee_id || Number(task.assignee_id) !== Number(requesterId)) {
                throw this.createError('Bạn không được giao công việc này nên không thể gửi yêu cầu gia hạn.', 403);
            }

            // 4. Kiểm tra xem đã tồn tại yêu cầu gia hạn PENDING nào cho task này chưa
            const pendingRequest = await ExtensionRequest.findOne({
                where: {
                    task_id: taskId,
                    status: 'PENDING'
                },
                transaction
            });
            if (pendingRequest) {
                throw this.createError('Đã tồn tại một yêu cầu gia hạn đang chờ duyệt cho công việc này.', 400);
            }

            // 5. Kiểm tra thời gian deadline mới phải lớn hơn deadline hiện tại
            if (new Date(requestedDeadline) <= new Date(task.deadline)) {
                throw this.createError('Hạn hoàn thành mới phải sau hạn hoàn thành hiện tại.', 400);
            }

            // Kiểm tra hạn hoàn thành mới phải nằm trong phạm vi ngày bắt đầu và kết thúc của dự án
            if (task.project) {
                if (task.project.start_date && new Date(requestedDeadline) < new Date(task.project.start_date)) {
                    throw this.createError(`Hạn hoàn thành mới không được trước ngày bắt đầu của dự án (${task.project.start_date}).`, 400);
                }
                if (task.project.end_date && new Date(requestedDeadline) > new Date(task.project.end_date)) {
                    throw this.createError(`Hạn hoàn thành mới không được vượt quá ngày kết thúc của dự án (${task.project.end_date}).`, 400);
                }
            }

            // 6. Tạo mới yêu cầu gia hạn trong database
            const request = await ExtensionRequest.create({
                task_id: taskId,
                requester_id: requesterId,
                current_deadline: task.deadline,
                requested_deadline: requestedDeadline,
                reason: reason,
                status: 'PENDING'
            }, { transaction });

            // 7. Gửi thông báo hệ thống cho PM dự án nếu dự án có PM quản lý
            if (task.project && task.project.manager_id) {
                await Notification.create({
                    user_id: task.project.manager_id,
                    type: 'DEADLINE_EXTENSION_REQUESTED',
                    title: 'Yêu cầu gia hạn deadline mới',
                    content: `Thành viên đã gửi yêu cầu gia hạn deadline cho công việc "${task.title}".`,
                    payload: {
                        taskId: task.id,
                        projectId: task.project_id,
                        requestId: request.id
                    }
                }, { transaction });
            }

            await transaction.commit();
            return request;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Phê duyệt yêu cầu gia hạn deadline
     * @param {number} requestId - ID yêu cầu gia hạn
     * @param {number} reviewedByUserId - ID người phê duyệt (PM hoặc ADMIN)
     * @param {string} [reviewNote] - Phản hồi từ PM
     * @returns {Promise<Object>} Yêu cầu gia hạn đã cập nhật
     */
    async approveRequest(requestId, reviewedByUserId, reviewNote) {
        const transaction = await sequelize.transaction();
        try {
            // Khóa dòng request bằng LOCK.UPDATE để tránh race condition khi duyệt đồng thời
            const request = await ExtensionRequest.findByPk(requestId, {
                lock: transaction.LOCK.UPDATE,
                transaction,
                include: [
                    { model: Task, as: 'task', include: [{ model: Project, as: 'project' }] },
                    { model: User, as: 'requester' }
                ]
            });

            if (!request) {
                throw this.createError('Không tìm thấy yêu cầu gia hạn.', 404);
            }
            if (request.status !== 'PENDING') {
                throw this.createError('Yêu cầu này đã được xử lý trước đó.', 400);
            }

            // 2. Kiểm tra quyền kiểm duyệt (Phải là PM của dự án đó hoặc ADMIN)
            const reviewer = await User.findByPk(reviewedByUserId, { transaction });
            if (!reviewer) {
                throw this.createError('Người kiểm duyệt không tồn tại trong hệ thống.', 404);
            }

            const isProjectManager = request.task && request.task.project && Number(request.task.project.manager_id) === Number(reviewedByUserId);
            const isAdmin = reviewer.role === 'ADMIN';

            if (!isProjectManager && !isAdmin) {
                throw this.createError('Bạn không có quyền phê duyệt yêu cầu này.', 403);
            }

            // 3. Cập nhật trạng thái yêu cầu gia hạn thành APPROVED
            request.status = 'APPROVED';
            request.reviewed_by = reviewedByUserId;
            request.review_note = reviewNote || null;
            request.reviewed_at = new Date();
            await request.save({ transaction });

            // 4. Cập nhật deadline mới cho Task
            const task = request.task;
            const oldDeadline = task.deadline;
            task.deadline = request.requested_deadline;
            task.updated_by = reviewedByUserId;
            await task.save({ transaction });

            // 5. Lưu lại lịch sử thay đổi công việc (TaskHistory)
            await TaskHistory.create({
                task_id: task.id,
                updated_by: reviewedByUserId,
                action_type: 'DEADLINE_UPDATED',
                field_name: 'deadline',
                old_value: oldDeadline,
                new_value: request.requested_deadline,
                note: `Gia hạn deadline được phê duyệt. Phản hồi PM: ${reviewNote || 'Không có'}`
            }, { transaction });

            // 6. Gửi thông báo hệ thống cho Member (người gửi yêu cầu)
            await Notification.create({
                user_id: request.requester_id,
                type: 'DEADLINE_EXTENSION_APPROVED',
                title: 'Yêu cầu gia hạn deadline đã được phê duyệt',
                content: `Yêu cầu gia hạn deadline cho công việc "${task.title}" của bạn đã được phê duyệt sang ngày ${request.requested_deadline}.`,
                payload: {
                    taskId: task.id,
                    projectId: task.project_id,
                    requestId: request.id
                }
            }, { transaction });

            await transaction.commit();
            return request;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Từ chối yêu cầu gia hạn deadline
     * @param {number} requestId - ID yêu cầu gia hạn
     * @param {number} reviewedByUserId - ID người phê duyệt (PM hoặc ADMIN)
     * @param {string} [reviewNote] - Lý do từ chối
     * @returns {Promise<Object>} Yêu cầu gia hạn đã cập nhật
     */
    async rejectRequest(requestId, reviewedByUserId, reviewNote) {
        const transaction = await sequelize.transaction();
        try {
            // Khóa dòng request bằng LOCK.UPDATE để tránh race condition khi duyệt đồng thời
            const request = await ExtensionRequest.findByPk(requestId, {
                lock: transaction.LOCK.UPDATE,
                transaction,
                include: [
                    { model: Task, as: 'task', include: [{ model: Project, as: 'project' }] },
                    { model: User, as: 'requester' }
                ]
            });

            if (!request) {
                throw this.createError('Không tìm thấy yêu cầu gia hạn.', 404);
            }
            if (request.status !== 'PENDING') {
                throw this.createError('Yêu cầu này đã được xử lý trước đó.', 400);
            }

            // 2. Kiểm tra quyền kiểm duyệt (Phải là PM của dự án đó hoặc ADMIN)
            const reviewer = await User.findByPk(reviewedByUserId, { transaction });
            if (!reviewer) {
                throw this.createError('Người kiểm duyệt không tồn tại trong hệ thống.', 404);
            }

            const isProjectManager = request.task && request.task.project && Number(request.task.project.manager_id) === Number(reviewedByUserId);
            const isAdmin = reviewer.role === 'ADMIN';

            if (!isProjectManager && !isAdmin) {
                throw this.createError('Bạn không có quyền từ chối yêu cầu này.', 403);
            }

            // 3. Cập nhật trạng thái yêu cầu gia hạn thành REJECTED
            request.status = 'REJECTED';
            request.reviewed_by = reviewedByUserId;
            request.review_note = reviewNote || null;
            request.reviewed_at = new Date();
            await request.save({ transaction });

            // 4. Lưu lại lịch sử công việc khi bị từ chối gia hạn
            await TaskHistory.create({
                task_id: request.task_id,
                updated_by: reviewedByUserId,
                action_type: 'DEADLINE_EXTENSION_REJECTED',
                field_name: 'deadline',
                old_value: request.current_deadline,
                new_value: request.current_deadline,
                note: `Yêu cầu gia hạn deadline bị từ chối. Phản hồi PM: ${reviewNote || 'Không có'}`
            }, { transaction });

            // 5. Gửi thông báo hệ thống thông báo cho Member
            await Notification.create({
                user_id: request.requester_id,
                type: 'DEADLINE_EXTENSION_REJECTED',
                title: 'Yêu cầu gia hạn deadline bị từ chối',
                content: `Yêu cầu gia hạn deadline cho công việc "${request.task.title}" của bạn đã bị từ chối. Phản hồi PM: ${reviewNote || 'Không có'}`,
                payload: {
                    taskId: request.task_id,
                    projectId: request.task.project_id,
                    requestId: request.id
                }
            }, { transaction });

            await transaction.commit();
            return request;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Lấy danh sách yêu cầu gia hạn đang chờ duyệt (Dành cho PM/ADMIN)
     * @param {Object} currentUser - Thông tin người dùng hiện tại (req.user)
     * @returns {Promise<Array>} Danh sách các yêu cầu đang chờ duyệt kèm thông tin liên quan
     */
    async getPendingRequests(currentUser) {
        if (!currentUser) {
            throw this.createError('Người dùng không hợp lệ.', 401);
        }

        const where = { status: 'PENDING' };
        let includeFilter = [];

        // Phân quyền: PM chỉ xem của project mình quản lý, ADMIN được xem tất cả
        if (currentUser.role === 'PM') {
            includeFilter = [
                {
                    model: Task,
                    as: 'task',
                    required: true,
                    include: [
                        {
                            model: Project,
                            as: 'project',
                            required: true,
                            where: { manager_id: currentUser.id }
                        }
                    ]
                },
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'full_name', 'email']
                }
            ];
        } else if (currentUser.role === 'ADMIN') {
            includeFilter = [
                {
                    model: Task,
                    as: 'task',
                    required: true,
                    include: [
                        {
                            model: Project,
                            as: 'project',
                            required: true
                        }
                    ]
                },
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'full_name', 'email']
                }
            ];
        } else {
            throw this.createError('Bạn không có quyền thực hiện chức năng này.', 403);
        }

        // 2. Thực hiện truy vấn danh sách yêu cầu gia hạn PENDING kèm thông tin Task, Project và Requester
        const requests = await ExtensionRequest.findAll({
            where,
            include: includeFilter,
            order: [['requested_at', 'DESC']]
        });

        return requests;
    }

    /**
     * Lấy danh sách yêu cầu gia hạn của bản thân (Dành cho Member gửi yêu cầu)
     * @param {number} requesterId - ID Member
     * @returns {Promise<Array>} Danh sách yêu cầu gia hạn của Member đó
     */
    async getMyRequests(requesterId) {
        // Tối ưu hóa: Bỏ qua query kiểm tra User tồn tại vì đã được xác thực bởi authMiddleware
        return await ExtensionRequest.findAll({
            where: { requester_id: requesterId },
            include: [
                {
                    model: Task,
                    as: 'task',
                    attributes: ['id', 'title', 'deadline']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'full_name', 'email']
                }
            ],
            order: [['requested_at', 'DESC']]
        });
    }

    /**
     * Helper tạo một Error Object kèm statusCode để Controller dễ dàng xử lý
     * @param {string} message - Thông điệp lỗi
     * @param {number} statusCode - HTTP status code
     * @returns {Error}
     */
    createError(message, statusCode) {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    }
}

module.exports = new ExtensionService();