const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// All notification routes require authentication
router.use(verifyToken);

router.get('/', notificationController.getAllNotifications);
router.get('/unread', notificationController.getUnreadNotifications);
router.put('/mark-read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
