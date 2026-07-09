const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { changePasswordSchema } = require('../validators/authValidator');

// Route dùng chung: ADMIN + PM có thể lấy danh sách user để assign thành viên dự án
router.get('/users', verifyToken, authorizeRoles('ADMIN', 'PM'), userController.getUsers);

// Route lấy danh sách user để assign (loại bỏ ADMIN)
router.get('/available-users', verifyToken, authorizeRoles('ADMIN', 'PM', 'MEMBER'), userController.getAvailableUsers);

// Route lấy thông tin profile của user đăng nhập
router.get('/users/profile', verifyToken, userController.getProfile);

// Route cập nhật thông tin profile của user đăng nhập
router.put('/users/profile', verifyToken, userController.updateProfile);

// Route đổi mật khẩu của user đăng nhập
router.put('/profile/change-password', verifyToken, validate({ body: changePasswordSchema }), userController.changePassword);

module.exports = router;
