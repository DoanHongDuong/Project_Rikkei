const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// All notification routes require authentication
router.use(verifyToken);

router.get('/unread', notificationController.getUnreadNotifications);
router.put('/mark-read', notificationController.markAsRead);

module.exports = router;
