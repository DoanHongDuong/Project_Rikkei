const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

// Lấy thống kê dashboard
router.get(
    '/statistics',
    verifyToken,
    (req, res) => dashboardController.getDashboardStatistics(req, res)
);

// Lấy hoạt động gần đây
router.get(
    '/activities',
    verifyToken,
    (req, res) => dashboardController.getRecentActivities(req, res)
);

module.exports = router;
