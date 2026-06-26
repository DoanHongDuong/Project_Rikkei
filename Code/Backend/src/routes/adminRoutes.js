const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const adminOnly = authorizeRoles('ADMIN');

// ĐĂNG KÝ CÁC ĐƯỜNG DẪN API ADMIN
router.get('/users', verifyToken, adminOnly, (req, res) => adminController.getAllUsersList(req, res));

// Tạo tài khoản nội bộ mới. Chỉ Admin được phép gọi API này.
router.post('/users', verifyToken, adminOnly, (req, res) => adminController.createNewUser(req, res));

router.put('/users/:id', verifyToken, adminOnly, (req, res) => adminController.updateUserStatus(req, res));
module.exports = router;
