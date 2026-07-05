const notificationService = require('../services/notificationService');

class NotificationController {
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
}

module.exports = new NotificationController();
