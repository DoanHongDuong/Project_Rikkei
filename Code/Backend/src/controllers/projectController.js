const projectService = require('../services/projectService');

class ProjectController {
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

    async getProjects(req, res) {
        try {
            const { projects, pagination } = await projectService.getProjects(req.query, req.user);

            return this.sendSuccess(
                res,
                200,
                'Lấy danh sách project thành công!',
                projects,
                pagination
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async createProject(req, res) {
        try {
            const project = await projectService.createProject(req.body, req.user);

            return this.sendSuccess(
                res,
                201,
                'Tạo project thành công!',
                project
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async getProjectDetail(req, res) {
        try {
            const project = await projectService.getProjectById(req.params.id, req.user);

            return this.sendSuccess(
                res,
                200,
                'Lấy chi tiết project thành công!',
                project
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async updateProject(req, res) {
        try {
            const project = await projectService.updateProject(req.params.id, req.body, req.user);

            return this.sendSuccess(
                res,
                200,
                'Cập nhật project thành công!',
                project
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async updateProjectStatus(req, res) {
        try {
            const project = await projectService.updateProjectStatus(req.params.id, req.body.status, req.user);

            return this.sendSuccess(
                res,
                200,
                'Cập nhật trạng thái project thành công!',
                project
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async archiveProject(req, res) {
        try {
            const project = await projectService.archiveProject(req.params.id, req.user);

            return this.sendSuccess(
                res,
                200,
                'Archive project thành công!',
                project
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async deleteProject(req, res) {
        try {
            const project = await projectService.softDeleteProject(req.params.id, req.user);

            return this.sendSuccess(
                res,
                200,
                'Xóa dự án thành công!',
                project
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async getProjectMembers(req, res) {
        try {
            const members = await projectService.getProjectMembers(req.params.id, req.user);

            return this.sendSuccess(
                res,
                200,
                'Lấy danh sách thành viên project thành công!',
                members
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async addProjectMember(req, res) {
        try {
            const member = await projectService.addProjectMember(req.params.id, req.body, req.user);

            return this.sendSuccess(
                res,
                201,
                'Thêm thành viên vào project thành công!',
                member
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }

    async removeProjectMember(req, res) {
        try {
            const member = await projectService.removeProjectMember(
                req.params.id,
                req.params.userId,
                req.user
            );

            return this.sendSuccess(
                res,
                200,
                'Xóa mềm thành viên khỏi project thành công!',
                member
            );
        } catch (error) {
            return this.sendError(res, error);
        }
    }
}

module.exports = new ProjectController();
