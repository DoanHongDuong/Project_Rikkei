/**
 * Middleware kiểm tra phân quyền theo role.
 *
 * Điều kiện đầu vào:
 * - verifyToken phải chạy trước middleware này.
 * - verifyToken giải mã JWT và gán payload vào req.user.
 *
 * Ví dụ:
 * router.get('/users', verifyToken, authorizeRoles('ADMIN'), controller)
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.length) {
            return res.status(500).json({
                message: 'Lỗi cấu hình phân quyền: chưa khai báo role hợp lệ.'
            });
        }

        const userRole = req.user && req.user.role;

        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({
                message: 'Từ chối truy cập! Bạn không có quyền thực hiện thao tác này.'
            });
        }

        next();
    };
};

module.exports = { authorizeRoles };
