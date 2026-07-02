const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const adminOrPm = authorizeRoles('ADMIN', 'PM');

// Lấy danh sách phòng ban
router.get(
    '/',
    verifyToken,
    (req, res) => departmentController.getAllDepartments(req, res)
);

// Lấy danh sách thành viên phòng ban (phải đặt trước /:id để tránh conflict)
router.get(
    '/:id/members',
    verifyToken,
    (req, res) => departmentController.getDepartmentMembers(req, res)
);

// Lấy chi tiết phòng ban
router.get(
    '/:id',
    verifyToken,
    (req, res) => departmentController.getDepartmentById(req, res)
);

// Tạo phòng ban mới (chỉ Admin hoặc PM)
router.post(
    '/',
    verifyToken,
    adminOrPm,
    (req, res) => departmentController.createDepartment(req, res)
);

// Cập nhật phòng ban (chỉ Admin hoặc PM)
router.put(
    '/:id',
    verifyToken,
    adminOrPm,
    (req, res) => departmentController.updateDepartment(req, res)
);

// Xóa phòng ban (chỉ Admin hoặc PM)
router.delete(
    '/:id',
    verifyToken,
    adminOrPm,
    (req, res) => departmentController.deleteDepartment(req, res)
);

module.exports = router;
