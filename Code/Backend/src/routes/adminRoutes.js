const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware'); // Đã viết ở Sprint 1
const userValidation = require('../middleware/userValidation');

// Middleware kiểm tra quyền ADMIN nội bộ file
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ message: 'Từ chối truy cập! Quyền này chỉ dành cho Admin.' });
    }
};

// 1. Lấy danh sách người dùng
router.get('/users', verifyToken, isAdmin, (req, res) => adminController.getAllUsersList(req, res));

// 2. Tạo tài khoản mới (ĐÃ HỢP NHẤT VÀ CÓ VALIDATE)
router.post(
    '/users',
    verifyToken,
    isAdmin,
    userValidation.validateCreateAndExpress, // Kiểm tra định dạng + trùng lặp
    (req, res) => adminController.createNewUser(req, res)
);

// 3. Cập nhật trạng thái người dùng
router.put('/users/:id', verifyToken, isAdmin, (req, res) => adminController.updateUserStatus(req, res));

// 4. Xóa mềm tài khoản nhân sự (Subtask trước)
router.delete('/users/:id', verifyToken, isAdmin, (req, res) => adminController.deleteUser(req, res));

module.exports = router;