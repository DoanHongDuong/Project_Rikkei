const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

// Import middleware bảo mật
const { verifyToken } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Tất cả các route phòng ban đều cần đăng nhập
router.use(verifyToken);

// Route lấy danh sách (Cả PM, Admin, Member đều cần xem để gán phòng ban)
router.get("/", departmentController.getAllDepartments);

// Route xem thành viên thuộc phòng ban (Ai đã đăng nhập đều xem được)
router.get("/:id/members", departmentController.getMembersByDepartment);

// Các route thay đổi cấu trúc công ty chỉ dành riêng cho ADMIN
router.post("/", roleMiddleware("ADMIN"), departmentController.createDepartment);
router.put("/:id", roleMiddleware("ADMIN"), departmentController.updateDepartment);
router.delete("/:id", roleMiddleware("ADMIN"), departmentController.deleteDepartment);

module.exports = router;