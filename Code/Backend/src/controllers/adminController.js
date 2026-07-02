const userService = require('../services/userService');
const dashboardService = require('../services/dashboardService');

class AdminController {
    // [GET] Lấy dữ liệu dashboard admin
    async getDashboardMetrics(req, res) {
        try {
            const metrics = await dashboardService.getAdminMetrics();
            return this.sendSuccess(
                res,
                200,
                'Lấy dữ liệu dashboard thành công!',
                metrics
            );
        } catch (error) {
            return this.sendError(res, 500, error.message);
        }
    }
    // --- Hàm bổ trợ định dạng Response thành công ---
    sendSuccess(res, statusCode, message, data = null, pagination = undefined) {
        const response = {
            success: true,
            message,
            data
        };

        if (pagination) {
            response.pagination = pagination;
        }

        return res.status(statusCode).json(response);
    }

    // --- Hàm bổ trợ định dạng Response lỗi ---
    sendError(res, statusCode, message) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: null
        });
    }

    // --- Hàm bổ trợ phân tích Http Status code dựa trên text lỗi ---
    resolveErrorStatus(error) {
        if (error.message.includes('Không tìm thấy')) {
            return 404;
        }
        return 400;
    }

    // [POST] Tạo mới người dùng
    async createNewUser(req, res) {
        try {
            const newUser = await userService.createUser(req.body);
            return this.sendSuccess(
                res,
                201,
                'Tạo tài khoản nhân viên thành công!',
                newUser
            );
        } catch (error) {
            return this.sendError(res, this.resolveErrorStatus(error), error.message);
        }
    }

    // [GET] Lấy danh sách toàn bộ người dùng (có phân trang)
    async getAllUsersList(req, res) {
        try {
            const { users, pagination } = await userService.getUsers(req.query);
            return this.sendSuccess(
                res,
                200,
                'Lấy danh sách người dùng thành công!',
                users,
                pagination
            );
        } catch (error) {
            console.error('getAllUsersList error:', error);
            return this.sendError(res, 500, 'Lỗi server khi lấy danh sách user.');
        }
    }

    // [GET] Lấy chi tiết thông tin một người dùng bằng ID
    async getUserDetail(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            return this.sendSuccess(
                res,
                200,
                'Lấy thông tin người dùng thành công!',
                user
            );
        } catch (error) {
            return this.sendError(res, this.resolveErrorStatus(error), error.message);
        }
    }

    // [PUT] Cập nhật toàn bộ thông tin người dùng
    async updateUser(req, res) {
        try {
            const updatedUser = await userService.updateUser(req.params.id, req.body);
            return this.sendSuccess(
                res,
                200,
                'Cập nhật người dùng thành công!',
                updatedUser
            );
        } catch (error) {
            return this.sendError(res, this.resolveErrorStatus(error), error.message);
        }
    }

    // [PATCH] Chỉ cập nhật riêng trạng thái hoạt động của người dùng
    async updateUserStatus(req, res) {
        try {
            const updatedUser = await userService.updateUserStatus(req.params.id, req.body.status);
            return this.sendSuccess(
                res,
                200,
                'Cập nhật trạng thái người dùng thành công!',
                updatedUser
            );
        } catch (error) {
            return this.sendError(res, this.resolveErrorStatus(error), error.message);
        }
    }

    // [DELETE] Xóa mềm / Vô hiệu hóa người dùng
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await userService.deleteSoftUser(id);
            return this.sendSuccess(
                res,
                200,
                'Người dùng đã bị vô hiệu hóa và xóa mềm thành công!'
            );
        } catch (error) {
            return this.sendError(res, this.resolveErrorStatus(error), error.message);
        }
    }
}

module.exports = new AdminController();