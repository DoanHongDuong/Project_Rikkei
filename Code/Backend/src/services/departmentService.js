const { Op } = require('sequelize');
const Department = require('../models/Department');

class DepartmentService {
    async getAllDepartments(filters = {}) {
        const { search } = filters;
        const where = {};

        if (search) {
            const keyword = `%${search}%`;
            where.name = { [Op.like]: keyword };
        }

        const departments = await Department.findAll({
            where,
            order: [['id', 'ASC']]
        });

        return departments;
    }

    async getDepartmentById(id) {
        const department = await Department.findByPk(id);

        if (!department) {
            throw new Error('Không tìm thấy phòng ban này!');
        }

        return department;
    }

    async createDepartment(data) {
        const { name, description } = data;

        const existingDepartment = await Department.findOne({ where: { name } });
        if (existingDepartment) {
            throw new Error('Tên phòng ban này đã tồn tại!');
        }

        const department = await Department.create({
            name,
            description
        });

        return this.getDepartmentById(department.id);
    }

    async updateDepartment(id, data) {
        const department = await Department.findByPk(id);

        if (!department) {
            throw new Error('Không tìm thấy phòng ban này!');
        }

        const { name, description } = data;

        if (name && name !== department.name) {
            const existingDepartment = await Department.findOne({
                where: {
                    name,
                    id: { [Op.ne]: id }
                }
            });

            if (existingDepartment) {
                throw new Error('Tên phòng ban này đã tồn tại!');
            }
        }

        await department.update({ name, description });

        return this.getDepartmentById(id);
    }

    async deleteDepartment(id) {
        const department = await Department.findByPk(id);

        if (!department) {
            throw new Error('Không tìm thấy phòng ban này!');
        }

        await department.destroy();

        return { message: 'Xóa phòng ban thành công!' };
    }

    async getDepartmentMembers(id) {
        const department = await Department.findByPk(id, {
            include: [{
                model: require('../models/User'),
                as: 'users'
            }]
        });

        if (!department) {
            throw new Error('Không tìm thấy phòng ban này!');
        }

        return department.users || [];
    }
}

module.exports = new DepartmentService();
