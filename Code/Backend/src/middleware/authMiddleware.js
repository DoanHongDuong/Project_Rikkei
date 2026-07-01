const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware xác thực JWT.
 *
 * Yêu cầu header:
 * Authorization: Bearer <access_token>
 *
 * Sau khi verify thành công, req.user sẽ có thông tin tối thiểu:
 * { id, role, email, full_name, status }
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Truy cập bị từ chối! Vui lòng gửi token theo định dạng Bearer.'
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Truy cập bị từ chối! Bạn chưa đăng nhập.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'full_name', 'email', 'role', 'status', 'department_id']
        });

        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc token không hợp lệ.' });
        }

        if (user.status === 'DISABLED') {
            return res.status(403).json({
                message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
            });
        }

        req.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            status: user.status,
            department_id: user.department_id
        };

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

module.exports = { verifyToken };
