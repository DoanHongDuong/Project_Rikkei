const { Op } = require('sequelize');
const Notification = require('../models/Notification');
const socketService = require('./socketService');
const Task = require('../models/Task');

class NotificationService {

    async broadcastAdminUpdate() {
        try {
            const User = require('../models/User');
            const admins = await User.findAll({ where: { role: 'ADMIN', status: 'ACTIVE' } });
            admins.forEach(admin => {
                socketService.emitToUser(admin.id, 'admin_report_updated', {});
            });
        } catch (error) {
            console.error('Lỗi khi broadcast admin update:', error);
        }
    }

    async broadcastProjectUpdate(projectId) {
        try {
            const ProjectMember = require('../models/ProjectMember');
            const Project = require('../models/Project');

            const memberships = await ProjectMember.findAll({
                where: { project_id: projectId, is_active: true }
            });
            const userIds = new Set(memberships.map(m => Number(m.user_id)));
            
            const project = await Project.findByPk(projectId);
            if (project && project.manager_id) {
                userIds.add(Number(project.manager_id));
            }

            userIds.forEach(userId => {
                socketService.emitToUser(userId, 'project_board_updated', { projectId });
            });
            this.broadcastAdminUpdate().catch(console.error);
        } catch (error) {
            console.error('Lỗi khi broadcast project update:', error);
        }
    }

    async createNotification(userId, type, title, content, payload = null) {
        try {
            const notification = await Notification.create({
                user_id: userId,
                type,
                title,
                content,
                payload,
                is_read: false
            });

            // Emit realtime event to the user
            socketService.emitToUser(userId, 'new_notification', notification.get({ plain: true }));

            return notification;
        } catch (error) {
            console.error('Lỗi khi tạo notification:', error);
            // Không throw error để tránh làm crash luồng chính của app (vd: tạo task)
            return null;
        }
    }

    async getAllNotifications(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { rows, count } = await Notification.findAndCountAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            const enriched = await this._enrichExtensionPayloads(rows);

            return {
                notifications: enriched,
                pagination: {
                    page,
                    limit,
                    totalItems: count,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            console.error('Lỗi khi lấy tất cả notifications:', error);
            throw this.createError('Không thể lấy danh sách thông báo', 500);
        }
    }

    async getUnreadNotifications(userId) {
        try {
            const notifications = await Notification.findAll({
                where: {
                    user_id: userId,
                    is_read: false
                },
                order: [['created_at', 'DESC']]
            });
            return await this._enrichExtensionPayloads(notifications);
        } catch (error) {
            console.error('Lỗi khi lấy notifications chưa đọc:', error);
            throw this.createError('Không thể lấy danh sách thông báo', 500);
        }
    }

    // Enrich DEADLINE_EXTENSION notifications that are missing project_id
    async _enrichExtensionPayloads(notifications) {
        const extensionTypes = ['DEADLINE_EXTENSION_REQUESTED', 'DEADLINE_EXTENSION_APPROVED', 'DEADLINE_EXTENSION_REJECTED'];
        const result = [];

        for (const n of notifications) {
            const plain = n.get({ plain: true });
            let payload = plain.payload;
            if (typeof payload === 'string') {
                try { payload = JSON.parse(payload); } catch (e) { payload = null; }
            }

            if (extensionTypes.includes(plain.type) && payload) {
                const taskId = payload.task_id || payload.taskId;
                const projectId = payload.project_id || payload.projectId;

                // Chuẩn hóa về camelCase (taskId/projectId) để khớp với getNavigationPath() ở FE,
                // đồng thời tự bù project_id cho các bản ghi cũ (nếu payload lúc tạo thiếu nó).
                if (taskId && !projectId) {
                    try {
                        const task = await Task.findByPk(taskId, { attributes: ['id', 'project_id'] });
                        payload = { ...payload, taskId, projectId: task ? task.project_id : undefined };
                    } catch (e) {
                        payload = { ...payload, taskId };
                    }
                } else {
                    payload = { ...payload, taskId, projectId };
                }
                plain.payload = payload;
            }

            result.push(plain);
        }

        return result;
    }

    async markAsRead(notificationIds, userId) {
        try {
            if (!notificationIds || notificationIds.length === 0) {
                return;
            }

            await Notification.update(
                {
                    is_read: true,
                    read_at: new Date()
                },
                {
                    where: {
                        id: { [Op.in]: notificationIds },
                        user_id: userId
                    }
                }
            );
        } catch (error) {
            console.error('Lỗi khi mark as read notification:', error);
            throw this.createError('Không thể đánh dấu đã đọc thông báo', 500);
        }
    }

    async markAllAsRead(userId) {
        try {
            await Notification.update(
                {
                    is_read: true,
                    read_at: new Date()
                },
                {
                    where: {
                        user_id: userId,
                        is_read: false
                    }
                }
            );
        } catch (error) {
            console.error('Lỗi khi mark all as read:', error);
            throw this.createError('Không thể đánh dấu tất cả đã đọc', 500);
        }
    }

    async deleteNotification(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                where: { id: notificationId, user_id: userId }
            });
            if (!notification) {
                throw this.createError('Không tìm thấy thông báo', 404);
            }
            await notification.destroy();
        } catch (error) {
            if (error.statusCode) throw error;
            console.error('Lỗi khi xóa notification:', error);
            throw this.createError('Không thể xóa thông báo', 500);
        }
    }

    async handleTaskUpdated(task, project = null) {
        try {
            const notifications = await Notification.findAll({
                where: { type: 'TASK_ASSIGNED', is_read: false }
            });

            for (let n of notifications) {
                let payload = n.payload;
                if (typeof payload === 'string') {
                    try { payload = JSON.parse(payload); } catch (e) { }
                }

                if (payload && String(payload.taskId) === String(task.id)) {
                    n.title = task.title;
                    n.content = task.description || 'Không có mô tả';
                    payload.priority = task.priority;
                    payload.status = task.status;
                    payload.deadline = task.deadline;
                    if (project) payload.projectName = project.name;
                    n.payload = payload;
                    await n.save();

                    socketService.emitToUser(n.user_id, 'notification_updated', n.get({ plain: true }));
                }
            }
        } catch (error) {
            console.error('Error in handleTaskUpdated', error);
        }
    }

    createError(message, statusCode) {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    }
}

module.exports = new NotificationService();