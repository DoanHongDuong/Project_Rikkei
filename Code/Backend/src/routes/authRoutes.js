const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { loginRateLimiter, forgotPasswordRateLimiter } = require("../middleware/rateLimitMiddleware");
const {
    loginSchema,
    forgotPasswordSchema,
    resetPasswordParamsSchema,
    resetPasswordSchema
} = require("../validators/authValidator");

// Hệ thống nội bộ: không cho phép public signup.
// Việc tạo tài khoản mới được chuyển sang Admin API: POST /api/admin/users
router.post("/login", loginRateLimiter, validate({ body: loginSchema }), authController.login);
router.post("/logout", verifyToken, authController.logout);

router.post(
    "/forgot-password",
    forgotPasswordRateLimiter,
    validate({ body: forgotPasswordSchema }),
    authController.forgotPassword
);

router.post(
    "/reset-password/:token",
    validate({ params: resetPasswordParamsSchema, body: resetPasswordSchema }),
    authController.resetPassword
);
module.exports = router;
