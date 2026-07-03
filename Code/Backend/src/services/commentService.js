const Comment = require('../models/Comment');
const User = require('../models/User');
const taskService = require('./taskService');

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
