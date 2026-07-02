const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// [GET] Lấy dữ liệu dashboard cho Member
router.get(
    '/member',
    verifyToken,
    authorizeRoles('ADMIN', 'PM', 'MEMBER'),
    (req, res) => dashboardController.getMemberDashboard(req, res)
);

// [GET] Lấy dữ liệu dashboard cho PM
router.get(
    '/pm',
    verifyToken,
    authorizeRoles('ADMIN', 'PM'),
    (req, res) => dashboardController.getPmDashboard(req, res)
);

module.exports = router;
