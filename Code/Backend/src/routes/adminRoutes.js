const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
    getUsersQuerySchema,
    userIdParamsSchema,
    createUserSchema,
    updateUserSchema,
    updateUserStatusSchema
} = require('../validators/adminValidator');

const adminOnly = authorizeRoles('ADMIN');

// ĐĂNG KÝ CÁC ĐƯỜNG DẪN API ADMIN
router.get(
    '/users',
    verifyToken,
    adminOnly,
    validate({ query: getUsersQuerySchema }),
    (req, res) => adminController.getAllUsersList(req, res)
);

// Tạo tài khoản nội bộ mới. Chỉ Admin được phép gọi API này.
router.post(
    '/users',
    verifyToken,
    adminOnly,
    validate({ body: createUserSchema }),
    (req, res) => adminController.createNewUser(req, res)
);

router.get(
    '/users/:id',
    verifyToken,
    adminOnly,
    validate({ params: userIdParamsSchema }),
    (req, res) => adminController.getUserDetail(req, res)
);

router.put(
    '/users/:id',
    verifyToken,
    adminOnly,
    validate({ params: userIdParamsSchema, body: updateUserSchema }),
    (req, res) => adminController.updateUser(req, res)
);

router.patch(
    '/users/:id/status',
    verifyToken,
    adminOnly,
    validate({ params: userIdParamsSchema, body: updateUserStatusSchema }),
    (req, res) => adminController.updateUserStatus(req, res)
);
module.exports = router;
