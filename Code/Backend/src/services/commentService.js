const Comment = require('../models/Comment');
const User = require('../models/User');
const taskService = require('./taskService');
const notificationService = require('./notificationService');

class CommentService {
    async create(taskId, currentUser, content, parentCommentId = null) {
        const task = await taskService.findTaskOrFail(taskId);
        await taskService.ensureCanViewTask(task, currentUser);

        const comment = await Comment.create({
            task_id: taskId,
            user_id: currentUser.id,
            parent_comment_id: parentCommentId,
            content
        });

        await taskService.createHistory(taskId, currentUser.id, 'COMMENT_ADDED', null, null, null, 'Thêm bình luận mới');

        // 1. Khởi tạo danh sách người đã nhận thông báo để tránh gửi trùng
        const notifiedUsers = new Set();
        notifiedUsers.add(Number(currentUser.id)); // Không gửi cho chính người comment

        // 2. Thông báo "Phản hồi bình luận" (COMMENT_REPLY) cho người comment gốc nếu là reply
        if (parentCommentId) {
            const parentComment = await Comment.findByPk(parentCommentId);
            if (parentComment && Number(parentComment.user_id) !== Number(currentUser.id)) {
                notifiedUsers.add(Number(parentComment.user_id));
                notificationService.createNotification(
                    parentComment.user_id,
                    'COMMENT_REPLY',
                    `${currentUser.full_name} đã phản hồi bình luận của bạn`,
                    content.substring(0, 100),
                    {
                        taskId: task.id,
                        projectId: task.project_id,
                        commenterName: currentUser.full_name,
                        taskTitle: task.title,
                        commentId: comment.id
                    }
                ).catch(console.error);
            }
        }

        // 3. Thông báo cho người được giao việc (nếu có)
        if (task.assignee_id && !notifiedUsers.has(Number(task.assignee_id))) {
            notifiedUsers.add(Number(task.assignee_id));
            notificationService.createNotification(
                task.assignee_id,
                'TASK_COMMENT',
                `Bình luận mới trong: ${task.title}`,
                `${currentUser.full_name} đã bình luận: ${content.substring(0, 100)}`,
                {
                    taskId: task.id,
                    projectId: task.project_id,
                    commenterName: currentUser.full_name,
                    taskTitle: task.title,
                    commentId: comment.id
                }
            ).catch(console.error);
        }

        // 4. Thông báo cho tất cả những người khác đã từng bình luận trong task này
        const otherComments = await Comment.findAll({
            where: { task_id: taskId, is_deleted: false },
            attributes: ['user_id'],
            group: ['user_id']
        });

        for (const c of otherComments) {
            const uid = Number(c.user_id);
            if (!notifiedUsers.has(uid)) {
                notifiedUsers.add(uid);
                notificationService.createNotification(
                    uid,
                    'TASK_COMMENT',
                    `Bình luận mới trong: ${task.title}`,
                    `${currentUser.full_name} đã bình luận: ${content.substring(0, 100)}`,
                    {
                        taskId: task.id,
                        projectId: task.project_id,
                        commenterName: currentUser.full_name,
                        taskTitle: task.title,
                        commentId: comment.id
                    }
                ).catch(console.error);
            }
        }

        // 5. Thông báo cho PM của dự án (nếu chưa được thông báo ở trên)
        try {
            const project = await taskService.findProjectOrFail(task.project_id);
            if (project && project.manager_id && !notifiedUsers.has(Number(project.manager_id))) {
                notifiedUsers.add(Number(project.manager_id));
                notificationService.createNotification(
                    project.manager_id,
                    'TASK_COMMENT',
                    `Bình luận mới trong: ${task.title}`,
                    `${currentUser.full_name} đã bình luận: ${content.substring(0, 100)}`,
                    {
                        taskId: task.id,
                        projectId: task.project_id,
                        commenterName: currentUser.full_name,
                        taskTitle: task.title,
                        commentId: comment.id
                    }
                ).catch(console.error);
            }
        } catch (error) {
            console.error('Lỗi khi gửi thông báo cho PM:', error);
        }

        return await this.getById(comment.id);
    }

    async getById(commentId) {
        return await Comment.findByPk(commentId, {
            include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }]
        });
    }

    async getByTask(taskId, currentUser) {
        const task = await taskService.findTaskOrFail(taskId);
        await taskService.ensureCanViewTask(task, currentUser);

        return await Comment.findAll({
            where: { task_id: taskId, is_deleted: false },
            include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
            order: [['created_at', 'ASC']]
        });
    }

    async softDelete(commentId, currentUser) {
        const comment = await Comment.findByPk(commentId);
        if (!comment || comment.is_deleted) {
            throw taskService.createError('Không tìm thấy bình luận', 404);
        }

        const task = await taskService.findTaskOrFail(comment.task_id);
        
        let canDelete = false;
        if (currentUser.role === 'ADMIN') {
            canDelete = true;
        } else if (Number(currentUser.id) === Number(comment.user_id)) {
            canDelete = true;
        } else if (currentUser.role === 'PM') {
            const project = await taskService.findProjectOrFail(task.project_id);
            if (Number(project.manager_id) === Number(currentUser.id)) {
                canDelete = true;
            }
        }

        if (!canDelete) {
            throw taskService.createError('Bạn không có quyền xóa bình luận này', 403);
        }

        comment.is_deleted = true;
        comment.deleted_at = new Date();
        comment.deleted_by = currentUser.id;
        await comment.save();

        await taskService.createHistory(task.id, currentUser.id, 'COMMENT_DELETED', null, null, null, 'Xóa bình luận');

        return true;
    }
}

module.exports = new CommentService();
