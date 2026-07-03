const { Op } = require('sequelize');
const Notification = require('../models/Notification');
const socketService = require('./socketService');

class NotificationService {
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

    async getUnreadNotifications(userId) {
        try {
            const notifications = await Notification.findAll({
                where: {
                    user_id: userId,
                    is_read: false
                },
                order: [['created_at', 'DESC']]
            });
            return notifications;
        } catch (error) {
            console.error('Lỗi khi lấy notifications chưa đọc:', error);
            throw this.createError('Không thể lấy danh sách thông báo', 500);
        }
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

    async handleTaskDeleted(taskId) {
        try {
            const notifications = await Notification.findAll({
                where: { type: 'TASK_ASSIGNED', is_read: false }
            });

            for (let n of notifications) {
                let payload = n.payload;
                if (typeof payload === 'string') {
                    try { payload = JSON.parse(payload); } catch (e) { }
                }

                if (payload && String(payload.taskId) === String(taskId)) {
                    n.is_read = true;
                    n.read_at = new Date();
                    await n.save();

                    socketService.emitToUser(n.user_id, 'notification_deleted', { id: n.id, taskId });
                }
            }
        } catch (error) {
            console.error('Error in handleTaskDeleted', error);
        }
    }

    async handleTaskUnassigned(taskId, userId) {
        try {
            if (!userId) return;
            const notifications = await Notification.findAll({
                where: { user_id: userId, type: 'TASK_ASSIGNED', is_read: false }
            });

            for (let n of notifications) {
                let payload = n.payload;
                if (typeof payload === 'string') {
                    try { payload = JSON.parse(payload); } catch (e) { }
                }

                if (payload && String(payload.taskId) === String(taskId)) {
                    n.is_read = true;
                    n.read_at = new Date();
                    await n.save();

                    socketService.emitToUser(n.user_id, 'notification_deleted', { id: n.id, taskId });
                }
            }
        } catch (error) {
            console.error('Error in handleTaskUnassigned', error);
        }
    }

    createError(message, statusCode) {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    }
}

module.exports = new NotificationService();
