const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class UserService {
    // 1. Logic: Thêm tài khoản nhân viên mới (Dành cho Admin)
    async createUser(userData) {
        const { full_name, email, password, role, department_id } = userData;

        if (!full_name || !email || !password) {
            throw new Error('full_name, email và password là bắt buộc khi tạo tài khoản.');
        }

        // Kiểm tra xem email đã tồn tại trong DB chưa
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email này đã tồn tại trên hệ thống!');
        }

        // Admin phải cung cấp password khởi tạo; backend hash trước khi lưu DB.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Chèn bản ghi mới vào MySQL
        return await User.create({
            full_name,
            email,
            password_hash: hashedPassword,
            role: role || 'MEMBER',
            status: 'ACTIVE', // Mặc định tài khoản mới tạo sẽ hoạt động luôn
            department_id: department_id || null
        });
    }

    // 2. Logic: Lấy danh sách toàn bộ User kèm tính năng Tìm Kiếm (Dành cho Admin)
    async getAllUsers(searchKeyword) {
    let whereCondition = {};

    if (searchKeyword) {
        whereCondition = {
            [Op.or]: [
                { full_name: { [Op.like]: `%${searchKeyword}%` } },
                { email: { [Op.like]: `%${searchKeyword}%` } }
            ]
        };
    }

    return await User.findAll({
        where: whereCondition,
        attributes: { exclude: ['password_hash'] },
        order: [['id', 'DESC']] // Sắp xếp theo ID cho an toàn tuyệt đối
    });
    }
    async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('Không tìm thấy người dùng này trên hệ thống!');
    }

    // Chỉ whitelist các field được phép cập nhật qua Admin API.
    // Tuyệt đối không truyền thẳng req.body để tránh ghi đè password_hash,
    // created_at, last_login_at hoặc các field nhạy cảm khác.
    const allowedFields = ['full_name', 'role', 'status', 'department_id'];
    const safeUpdateData = {};

    allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
            safeUpdateData[field] = updateData[field];
        }
    });

    return await user.update(safeUpdateData);
}
}

module.exports = new UserService();
