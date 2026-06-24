const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware'); // Đã viết ở Sprint 1

// Middleware kiểm tra quyền ADMIN nội bộ file nếu bạn chưa viết roleMiddleware riêng
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ message: 'Từ chối truy cập! Quyền này chỉ dành cho Admin.' });
    }
};

// ĐĂNG KÝ CÁC ĐƯỜNG DẪN API TRONG SPRINT 2
router.get('/users', verifyToken, isAdmin, (req, res) => adminController.getAllUsersList(req, res));

// 2. Tạo tài khoản mới (Dòng số 20 bị lỗi của bạn - sửa thành dòng dưới này)
router.post('/users', verifyToken, isAdmin, (req, res) => adminController.createNewUser(req, res));

router.put('/users/:id', verifyToken, isAdmin, (req, res) => adminController.updateUserStatus(req, res));
module.exports = router;