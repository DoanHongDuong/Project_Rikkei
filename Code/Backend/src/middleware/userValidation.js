const User = require('../models/User');

class UserValidation {
    async validateCreateAndExpress(req, res, next) {
        try {
            const { full_name, email, role } = req.body;
            const userId = req.params.id; // Dùng cho trường hợp update nếu cần

            // 1. Kiểm tra không bỏ trống trường bắt buộc khi tạo mới
            if (!userId && (!full_name || !email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ Họ tên và Email!'
                });
            }

            // 2. Kiểm tra định dạng Email chuẩn Regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng Email không hợp lệ! Ví dụ: nhânviên@gmail.com'
                });
            }

            // 3. Kiểm tra kiểm trùng lặp Email trong MySQL (Yêu cầu subtask)
            if (email) {
                const existingUser = await User.findOne({ where: { email } });

                // Hành động tạo mới nhân viên mà email đã có người dùng
                if (!userId && existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email này đã tồn tại trên hệ thống!'
                    });
                }

                // Hành động cập nhật nhân viên mà email trùng với người khác
                if (userId && existingUser && existingUser.id !== parseInt(userId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email này đang thuộc về một tài khoản khác!'
                    });
                }
            }

            // Nếu vượt qua mọi vòng kiểm tra, đi tiếp đến Controller
            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra dữ liệu đầu vào.'
            });
        }
    }
}

module.exports = new UserValidation();