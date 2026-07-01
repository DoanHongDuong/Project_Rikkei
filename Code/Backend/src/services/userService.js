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
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }

    buildUserWhere({ search, role, status, department_id }) {
        const where = {};

        if (search) {
            const keyword = `%${search}%`;
            where[Op.or] = [
                { full_name: { [Op.like]: keyword } },
                { email: { [Op.like]: keyword } }
            ];
        }

        if (role) {
            where.role = role;
        }

        if (status) {
            where.status = status;
        }

        if (department_id) {
            where.department_id = department_id;
        }

        return where;
    }

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

    async getUsers(filters) {
        const page = Number(filters.page);
        const limit = Number(filters.limit);
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

    async getUserById(id) {
        const user = await User.findByPk(id, {
            attributes: USER_SAFE_ATTRIBUTES
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

        const safeUpdateData = this.pickSafeUpdateData(updateData);

        if (safeUpdateData.email) {
            safeUpdateData.email = this.normalizeEmail(safeUpdateData.email);

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

    async updateUserStatus(id, status) {
        return this.updateUser(id, { status });
    }

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
