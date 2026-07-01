const taskService = require('../services/taskService');

class TaskController {
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

    sendError(res, error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Lỗi server.',
            data: null
        });
    }

    async getTasks(req, res) {
        try {
            const { tasks, pagination } = await taskService.getTasks(req.query, req.user);

            return this.sendSuccess(res, 200, 'Lấy danh sách task thành công!', tasks, pagination);
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async getTaskDetail(req, res) {
        try {
            const task = await taskService.getTaskById(req.params.id, req.user);

            return this.sendSuccess(res, 200, 'Lấy chi tiết task thành công!', task);
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async createTask(req, res) {
        try {
            const task = await taskService.createTask(req.body, req.user);

            return this.sendSuccess(res, 201, 'Tạo task thành công!', task);
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async updateTask(req, res) {
        try {
            const task = await taskService.updateTask(req.params.id, req.body, req.user);

            return this.sendSuccess(res, 200, 'Cập nhật task thành công!', task);
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async updateTaskStatus(req, res) {
        try {
            const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user);

            return this.sendSuccess(res, 200, 'Cập nhật trạng thái task thành công!', task);
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async assignTask(req, res) {
        try {
            const task = await taskService.assignTask(req.params.id, req.body.assignee_id, req.user);

            return this.sendSuccess(res, 200, 'Assign task thành công!', task);
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async deleteTask(req, res) {
        try {
            const task = await taskService.softDeleteTask(req.params.id, req.user);

            return this.sendSuccess(res, 200, 'Xóa mềm task thành công!', task);
        } catch (error) {
            return this.sendError(res, error);
        }
    }
}

module.exports = new TaskController();
