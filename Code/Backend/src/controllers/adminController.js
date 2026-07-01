const userService = require('../services/userService');

class AdminController {
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

    sendError(res, statusCode, message) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: null
        });
    }

    resolveErrorStatus(error) {
        if (error.message.includes('Không tìm thấy')) {
            return 404;
        }

        return 400;
    }

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
}

module.exports = new AdminController();
