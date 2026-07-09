const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');

const VALID_ROLES = ['ADMIN', 'PM', 'MEMBER'];
const VALID_STATUSES = ['ACTIVE', 'DISABLED'];
const USER_SAFE_ATTRIBUTES = [
    'id',
    'full_name',
    'email',
    'role',
    'status',
    'department_id',
    'password_changed_at',
    'last_login_at',
    'created_at',
    'updated_at'
];

class UserService {
    // Chuẩn hóa định dạng Email
    normalizeEmail(email) {
        return email ? email.trim().toLowerCase() : '';
    }

    // Xây dựng điều kiện lọc cho Sequelize
    buildUserWhere({ search, role, exclude_role, status, department_id, exclude_user_ids }) {
        const where = {};

        if (search) {
            const keyword = `%${search}%`;
            where[Op.or] = [
                { full_name: { [Op.like]: keyword } },
                { email: { [Op.like]: keyword } }
            ];
        }

        if (exclude_role) {
            where.role = { [Op.ne]: exclude_role };
        } else if (role) {
            where.role = role;
        }

        if (status) {
            where.status = status;
        }

        if (department_id) {
            where.department_id = department_id;
        }

        if (exclude_user_ids && exclude_user_ids.length > 0) {
            where.id = { [Op.notIn]: exclude_user_ids };
        }

        return where;
    }

    // 1. Tạo tài khoản người dùng mới
    async createUser(userData) {
        const { full_name, email, password, role, department_id } = userData;
        const normalizedEmail = this.normalizeEmail(email);
        const safeRole = role || 'MEMBER';

        if (!VALID_ROLES.includes(safeRole)) {
            throw new Error('Role không hợp lệ. Role phải là ADMIN, PM hoặc MEMBER.');
        }

        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
            throw new Error('Email này đã tồn tại trên hệ thống!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            full_name,
            email: normalizedEmail,
            password_hash: hashedPassword,
            role: safeRole,
            status: 'ACTIVE',
            department_id: department_id || null
        });

        return this.getUserById(user.id);
    }

    // 2. Lấy danh sách toàn bộ User có phân trang, lọc và tìm kiếm chuyên sâu
    async getUsers(filters) {
        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const offset = (page - 1) * limit;
        const where = this.buildUserWhere(filters);

        const { rows, count } = await User.findAndCountAll({
            where,
            attributes: USER_SAFE_ATTRIBUTES,
            order: [['id', 'DESC']],
            limit,
            offset
        });

        return {
            users: rows,
            pagination: {
                page,
                limit,
                totalItems: count,
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    // 3. Lấy chi tiết thông tin người dùng theo ID (Đã loại bỏ trùng lặp)
    async getUserById(id) {
        const user = await User.findByPk(id, {
            attributes: USER_SAFE_ATTRIBUTES
        });

        if (!user) {
            throw new Error('Không tìm thấy người dùng này trên hệ thống!');
        }

        return user;
    }

    // 4. Cập nhật thông tin toàn diện của người dùng (Đã bóc tách dữ liệu an toàn)
    async updateUser(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('Không tìm thấy người dùng này trên hệ thống!');
        }

        const safeUpdateData = this.pickSafeUpdateData(updateData);

        if (safeUpdateData.email) {
            safeUpdateData.email = this.normalizeEmail(safeUpdateData.email);

            // Kiểm tra xem email mới có bị trùng với người khác không
            const existingUser = await User.findOne({
                where: {
                    email: safeUpdateData.email,
                    id: { [Op.ne]: id }
                }
            });

            if (existingUser) {
                throw new Error('Email này đã tồn tại trên hệ thống!');
            }
        }

        if (safeUpdateData.role && !VALID_ROLES.includes(safeUpdateData.role)) {
            throw new Error('Role không hợp lệ. Role phải là ADMIN, PM hoặc MEMBER.');
        }

        if (safeUpdateData.status && !VALID_STATUSES.includes(safeUpdateData.status)) {
            throw new Error('Trạng thái không hợp lệ. Status phải là ACTIVE hoặc DISABLED.');
        }

        await user.update(safeUpdateData);
        return this.getUserById(id);
    }

    // 5. Cập nhật riêng trạng thái hoạt động của tài khoản
    async updateUserStatus(id, status) {
        return this.updateUser(id, { status });
    }

    // 6. Xóa mềm tài khoản người dùng (Chuyển trạng thái sang DISABLED trước khi xóa mềm)
    async deleteSoftUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('Không tìm thấy người dùng này trên hệ thống!');
        }
        
        user.status = 'DISABLED'; 
        await user.save(); 
        
        return await user.destroy(); // Thực hiện soft delete qua cấu hình Paranoid của Sequelize
    }

    // Lấy danh sách ID user đang thuộc một project (để loại trừ khi assign)
    async getExcludedProjectUserIds(projectId) {
        const ProjectMember = require('../models/ProjectMember');
        const projectMembers = await ProjectMember.findAll({
            where: { project_id: projectId, is_active: true },
            attributes: ['user_id']
        });
        return projectMembers.map(m => m.user_id);
    }

    // Thay đổi mật khẩu người dùng
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại.');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không chính xác.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({
            password_hash: hashedPassword,
            password_changed_at: new Date()
        });

        return user;
    }

    // Hàm lọc dữ liệu đầu vào chống chèn trường cấm
    pickSafeUpdateData(updateData) {
        const allowedFields = ['full_name', 'email', 'role', 'status', 'department_id'];
        const safeUpdateData = {};

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(updateData, field)) {
                safeUpdateData[field] = updateData[field];
            }
        });

        return safeUpdateData;
    }
}

module.exports = new UserService();