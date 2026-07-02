const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// --- Import các Middleware xác thực và phân quyền ---
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// --- Import các bộ Validator định dạng dữ liệu ---
const {
    getUsersQuerySchema,
    userIdParamsSchema,
    createUserSchema,
    updateUserSchema,
    updateUserStatusSchema
} = require('../validators/adminValidator');

// Định nghĩa quyền cấu hình riêng cho Admin
const adminOnly = authorizeRoles('ADMIN');

// ==========================================
// ĐĂNG KÝ CÁC ĐƯỜNG DẪN API QUẢN TRỊ (ADMIN)
// ==========================================

// 1. [GET] Lấy danh sách toàn bộ người dùng (Có Validate Query lọc/phân trang)
router.get(
    '/users',
    verifyToken,
    adminOnly,
    validate({ query: getUsersQuerySchema }),
    (req, res) => adminController.getAllUsersList(req, res)
);

// 2. [POST] Tạo tài khoản nhân sự nội bộ mới
router.post(
    '/users',
    verifyToken,
    adminOnly,
    validate({ body: createUserSchema }),
    (req, res) => adminController.createNewUser(req, res)
);

// 3. [GET] Lấy thông tin chi tiết một người dùng cụ thể bằng ID
router.get(
    '/users/:id',
    verifyToken,
    authorizeRoles('ADMIN', 'PM', 'MEMBER'),
    validate({ params: userIdParamsSchema }),
    (req, res) => adminController.getUserDetail(req, res)
);

// 4. [PUT] Cập nhật thông tin toàn diện của người dùng
router.put(
    '/users/:id',
    verifyToken,
    adminOnly,
    validate({ params: userIdParamsSchema, body: updateUserSchema }),
    (req, res) => adminController.updateUser(req, res)
);

// 5. [PATCH] Chỉ cập nhật riêng trạng thái (status) hoạt động của tài khoản
router.patch(
    '/users/:id/status',
    verifyToken,
    adminOnly,
    validate({ params: userIdParamsSchema, body: updateUserStatusSchema }),
    (req, res) => adminController.updateUserStatus(req, res)
);

// 6. [DELETE] Xóa mềm / Vô hiệu hóa vĩnh viễn tài khoản người dùng
router.delete(
    '/users/:id',
    verifyToken,
    adminOnly,
    validate({ params: userIdParamsSchema }),
    (req, res) => adminController.deleteUser(req, res)
);

module.exports = router;