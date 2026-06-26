/**
 * Middleware kiểm tra quyền (role) của người dùng.
 * Sử dụng: roleMiddleware("ADMIN") hoặc roleMiddleware("ADMIN", "PM")
 * Yêu cầu: authMiddleware (verifyToken) phải chạy trước để gán req.user
 */
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        // Kiểm tra đã xác thực chưa
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Truy cập bị từ chối! Bạn chưa đăng nhập."
            });
        }

        // Kiểm tra role có nằm trong danh sách được phép không
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Từ chối truy cập! Bạn không có quyền thực hiện thao tác này."
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
