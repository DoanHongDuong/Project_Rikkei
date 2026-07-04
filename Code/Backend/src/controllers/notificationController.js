const notificationService = require('../services/notificationService');

class NotificationController {
    async getAllNotifications(req, res) {
        try {
            const userId = req.user.id;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await notificationService.getAllNotifications(userId, page, limit);
            res.status(200).json({ success: true, message: 'OK', data: result });
        } catch (error) {
            console.error('getAllNotifications error:', error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
        }
    }

    async getUnreadNotifications(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await notificationService.getUnreadNotifications(userId);
            res.status(200).json({ success: true, message: 'OK', data: notifications });
        } catch (error) {
            console.error('getUnreadNotifications error:', error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
        }
    }

    async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const { notificationIds } = req.body;

            if (!Array.isArray(notificationIds)) {
                return res.status(400).json({ success: false, message: 'notificationIds phải là một mảng.' });
            }

            await notificationService.markAsRead(notificationIds, userId);
            res.status(200).json({ success: true, message: 'Đã đánh dấu đọc thành công' });
        } catch (error) {
            console.error('markAsRead error:', error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
        }
    }

    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            await notificationService.markAllAsRead(userId);
            res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
        } catch (error) {
            console.error('markAllAsRead error:', error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
        }
    }

    async deleteNotification(req, res) {
        try {
            const userId = req.user.id;
            const notificationId = Number(req.params.id);
            await notificationService.deleteNotification(notificationId, userId);
            res.status(200).json({ success: true, message: 'Đã xóa thông báo thành công' });
        } catch (error) {
            console.error('deleteNotification error:', error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
        }
    }
}

module.exports = new NotificationController();
