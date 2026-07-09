const departmentService = require('../services/departmentService');

// 1. Lấy danh sách toàn bộ phòng ban
exports.getAllDepartments = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const data = await departmentService.getAllDepartments(search);

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

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Tên phòng ban không được để trống!' });
        }

        const newDept = await departmentService.createDepartment({ name, description });

        return res.status(201).json({
            success: true,
            message: 'Tạo phòng ban thành công!',
            data: newDept,
        });
    } catch (error) {
        if (error.message === 'Tên phòng ban này đã tồn tại!') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// 3. Cập nhật phòng ban
exports.updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const department = await departmentService.updateDepartment(id, { name, description });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công!',
            data: department,
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy phòng ban cần sửa!') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === 'Tên phòng ban này đã tồn tại trên hệ thống!') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// 4. Xóa phòng ban
exports.deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        await departmentService.deleteDepartment(id);

        return res.status(200).json({
            success: true,
            message: 'Xóa phòng ban thành công!',
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy phòng ban cần xóa!') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === 'Không thể xóa phòng ban đang có dự án đang chạy (ACTIVE/ON_HOLD)!') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// 5. Lấy danh sách thành viên thuộc phòng ban
exports.getMembersByDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await departmentService.getMembersByDepartment(id);

        return res.status(200).json({
            success: true,
            department: result.departmentName,
            count: result.members.length,
            data: result.members,
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy phòng ban!') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};