const departmentService = require('../services/departmentService');

class DepartmentController {
    sendSuccess(res, statusCode, message, data = null) {
        const response = {
            success: true,
            message,
            data
        };

        return res.status(statusCode).json(response);
    }

    sendError(res, statusCode, message) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: null
        });
    }

    async getAllDepartments(req, res) {
        try {
            const departments = await departmentService.getAllDepartments(req.query);

            return this.sendSuccess(
                res,
                200,
                'Lấy danh sách phòng ban thành công!',
                departments
            );
        } catch (error) {
            return this.sendError(res, 500, error.message || 'Lỗi server khi lấy danh sách phòng ban.');
        }
    }

    async getDepartmentById(req, res) {
        try {
            const department = await departmentService.getDepartmentById(req.params.id);

            return this.sendSuccess(
                res,
                200,
                'Lấy thông tin phòng ban thành công!',
                department
            );
        } catch (error) {
            return this.sendError(res, 404, error.message);
        }
    }

    async createDepartment(req, res) {
        try {
            const department = await departmentService.createDepartment(req.body);

            return this.sendSuccess(
                res,
                201,
                'Tạo phòng ban thành công!',
                department
            );
        } catch (error) {
            return this.sendError(res, 400, error.message);
        }
    }

    async updateDepartment(req, res) {
        try {
            const department = await departmentService.updateDepartment(req.params.id, req.body);

            return this.sendSuccess(
                res,
                200,
                'Cập nhật phòng ban thành công!',
                department
            );
        } catch (error) {
            return this.sendError(res, 400, error.message);
        }
    }

    async deleteDepartment(req, res) {
        try {
            const result = await departmentService.deleteDepartment(req.params.id);

            return this.sendSuccess(
                res,
                200,
                result.message,
                null
            );
        } catch (error) {
            return this.sendError(res, 404, error.message);
        }
    }

    async getDepartmentMembers(req, res) {
        try {
            const members = await departmentService.getDepartmentMembers(req.params.id);

            return this.sendSuccess(
                res,
                200,
                'Lấy danh sách thành viên phòng ban thành công!',
                members
            );
        } catch (error) {
            return this.sendError(res, 404, error.message);
        }
    }
}

module.exports = new DepartmentController();
