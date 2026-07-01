/**
 * Middleware kiểm tra phân quyền theo vai trò (Role).
 * * Điều kiện đầu vào:
 * - verifyToken/authMiddleware phải chạy trước middleware này để gán req.user
 * * Ví dụ sử dụng:
 * router.get('/users', verifyToken, authorizeRoles('ADMIN', 'PM'), controller)
 * hoặc: router.get('/settings', verifyToken, roleMiddleware('ADMIN'), controller)
 */

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // 1. Kiểm tra đã xác thực đăng nhập chưa (req.user có tồn tại không)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Truy cập bị từ chối! Bạn chưa đăng nhập hoặc token không hợp lệ."
            });
        }

        // 2. Kiểm tra lỗi cấu hình phía Developer nếu quên truyền tham số role vào middleware
        if (!roles.length) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi cấu hình phân quyền: Chưa khai báo vai trò (role) hợp lệ.'
            });
        }

        // 3. Kiểm tra vai trò của người dùng có nằm trong danh sách được phép không
        const userRole = req.user.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Từ chối truy cập! Bạn không có quyền thực hiện thao tác này.'
            });
        }

        // Hợp lệ, cho phép đi tiếp vào Controller
        next();
    };
};

// Tạo bí danh (Alias) roleMiddleware trỏ chung về một logic để tránh lỗi code ở các file route cũ
const roleMiddleware = authorizeRoles;

// Export cả 2 dạng để file nào thích dùng kiểu require() đối tượng hay giải nén cấu trúc {} đều chạy được
module.exports = authorizeRoles; 
module.exports.authorizeRoles = authorizeRoles;
module.exports.roleMiddleware = roleMiddleware;