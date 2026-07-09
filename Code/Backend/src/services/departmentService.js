const { Op } = require('sequelize');
const Department = require('../models/Department');
const User = require('../models/User');
const Project = require('../models/Project');

class DepartmentService {
    async getAllDepartments(search) {
        let whereCondition = {};
        if (search) {
            whereCondition = {
                name: { [Op.like]: `%${search}%` }
            };
        }

        const departments = await Department.findAll({
            where: whereCondition,
            order: [['created_at', 'DESC']], // Phòng mới tạo xếp lên đầu
        });

        // Đếm số lượng user cho từng phòng ban
        const data = await Promise.all(departments.map(async (dept) => {
            const usersCount = await User.count({ where: { department_id: dept.id } });
            return {
                ...dept.toJSON(),
                users: usersCount
            };
        }));

        return data;
    }

    async createDepartment(data) {
        const { name, description } = data;

        // Kiểm tra trùng tên
        const existingDept = await Department.findOne({ where: { name: name.trim() } });
        if (existingDept) {
            throw new Error('Tên phòng ban này đã tồn tại!');
        }

        const newDept = await Department.create({
            name: name.trim(),
            description: description ? description.trim() : null,
        });

        return newDept;
    }

    async updateDepartment(id, data) {
        const { name, description } = data;

        const department = await Department.findByPk(id);
        if (!department) {
            throw new Error('Không tìm thấy phòng ban cần sửa!');
        }

        // Nếu đổi tên, kiểm tra xem tên mới có trùng với phòng ban khác không
        if (name && name.trim() !== department.name) {
            const existingDept = await Department.findOne({ where: { name: name.trim() } });
            if (existingDept) {
                throw new Error('Tên phòng ban này đã tồn tại trên hệ thống!');
            }
            department.name = name.trim();
        }

        if (description !== undefined) {
            department.description = description ? description.trim() : null;
        }

        await department.save();

        return department;
    }

    async deleteDepartment(id) {
        const department = await Department.findByPk(id);
        if (!department) {
            throw new Error('Không tìm thấy phòng ban cần xóa!');
        }

        // Kiểm tra xem phòng ban có dự án nào đang chạy không
        const activeProjectsCount = await Project.count({
            include: [{
                model: User,
                as: 'manager',
                where: { department_id: id }
            }],
            where: {
                status: ['ACTIVE', 'ON_HOLD']
            }
        });

        if (activeProjectsCount > 0) {
            throw new Error('Không thể xóa phòng ban đang có dự án đang chạy (ACTIVE/ON_HOLD)!');
        }

        await department.destroy();
    }

    async getMembersByDepartment(id) {
        const department = await Department.findByPk(id);
        if (!department) {
            throw new Error('Không tìm thấy phòng ban!');
        }

        const members = await User.findAll({
            where: { department_id: id },
            attributes: { exclude: ['password_hash'] },
            order: [['full_name', 'ASC']]
        });

        return {
            departmentName: department.name,
            members
        };
    }
}

module.exports = new DepartmentService();
