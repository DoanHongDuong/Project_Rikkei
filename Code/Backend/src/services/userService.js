const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class UserService {
    // 1. Logic: Thêm tài khoản nhân viên mới (Dành cho Admin)
    async createUser(userData) {
        // Kiểm tra xem email đã tồn tại trong DB chưa
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (existingUser) {
            throw new Error('Email này đã tồn tại trên hệ thống!');
        }

        // Tự động băm (hash) mật khẩu mặc định trước khi lưu vào DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password || '123456', salt); // Mặc định là 123456 nếu không nhập

        // Chèn bản ghi mới vào MySQL
        return await User.create({
            full_name: userData.full_name,
            email: userData.email,
            password_hash: hashedPassword,
            role: userData.role || 'MEMBER',
            status: 'ACTIVE', // Mặc định tài khoản mới tạo sẽ hoạt động luôn
            department_id: userData.department_id || null
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

    async getUserById(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) {
            throw new Error('Không tìm thấy người dùng này trên hệ thống!');
        }
        return user;
    }
    async updateUser(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('Không tìm thấy người dùng này trên hệ thống!');
        }

        // Tiến hành cập nhật dữ liệu mới (status: "INACTIVE") vào MySQL
        return await user.update(updateData);
    }
    async deleteSoftUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('Không tìm thấy người dùng này trên hệ thống!');
        }
        user.status = 'DISABLED'; // Cập nhật trạng thái thành "DISABLED"
        await user.save(); // Lưu thay đổi vào cơ sở dữ liệu
        return await user.destroy(); // Thực hiện soft delete (xóa mềm) bản ghi
    }
}

module.exports = new UserService();