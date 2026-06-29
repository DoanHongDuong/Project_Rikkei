const Department = require("../models/Department");
const User = require("../models/User");

const { Op } = require("sequelize");

// 1. Lấy danh sách toàn bộ phòng ban
exports.getAllDepartments = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        let whereCondition = {};
        
        if (search) {
            whereCondition = {
                name: { [Op.like]: `%${search}%` }
            };
        }

        const departments = await Department.findAll({
            where: whereCondition,
            order: [["created_at", "DESC"]], // Phòng mới tạo xếp lên đầu
        });

        // Đếm số lượng user cho từng phòng ban
        const data = await Promise.all(departments.map(async (dept) => {
            const usersCount = await User.count({ where: { department_id: dept.id } });
            return {
                ...dept.toJSON(),
                users: usersCount
            };
        }));

        return res.status(200).json({
            success: true,
            data: data,
        });
    } catch (error) {
        next(error); // Chuyển cho errorHandler.js xử lý
    }
};

// 2. Tạo mới phòng ban
exports.createDepartment = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, message: "Tên phòng ban không được để trống!" });
        }

        // Kiểm tra trùng tên trùng (Unique)
        const existingDept = await Department.findOne({ where: { name: name.trim() } });
        if (existingDept) {
            return res.status(400).json({ success: false, message: "Tên phòng ban này đã tồn tại!" });
        }

        const newDept = await Department.create({
            name: name.trim(),
            description: description ? description.trim() : null,
        });

        return res.status(201).json({
            success: true,
            message: "Tạo phòng ban thành công!",
            data: newDept,
        });
    } catch (error) {
        next(error);
    }
};

// 3. Cập nhật phòng ban
exports.updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const department = await Department.findByPk(id);
        if (!department) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng ban cần sửa!" });
        }

        // Nếu đổi tên, kiểm tra xem tên mới có trùng với phòng ban khác không
        if (name && name.trim() !== department.name) {
            const existingDept = await Department.findOne({ where: { name: name.trim() } });
            if (existingDept) {
                return res.status(400).json({ success: false, message: "Tên phòng ban này đã tồn tại trên hệ thống!" });
            }
            department.name = name.trim();
        }

        if (description !== undefined) {
            department.description = description ? description.trim() : null;
        }

        await department.save();

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin thành công!",
            data: department,
        });
    } catch (error) {
        next(error);
    }
};

// 4. Xóa phòng ban
exports.deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const department = await Department.findByPk(id);
        if (!department) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng ban cần xóa!" });
        }

        // Thực hiện xóa cứng/xóa mềm tùy cấu hình hệ thống của bạn (ở đây dùng destroy chuẩn)
        await department.destroy();

        return res.status(200).json({
            success: true,
            message: "Xóa phòng ban thành công!",
        });
    } catch (error) {
        next(error);
    }
};

// 5. Lấy danh sách thành viên thuộc phòng ban
exports.getMembersByDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const department = await Department.findByPk(id);
        if (!department) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng ban!" });
        }

        const members = await User.findAll({
            where: { department_id: id },
            attributes: { exclude: ['password_hash'] },
            order: [['full_name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            department: department.name,
            count: members.length,
            data: members,
        });
    } catch (error) {
        next(error);
    }
};