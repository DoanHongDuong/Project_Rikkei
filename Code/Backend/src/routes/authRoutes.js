const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Hệ thống nội bộ: không cho phép public signup.
// Việc tạo tài khoản mới được chuyển sang Admin API: POST /api/admin/users
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
module.exports = router;
