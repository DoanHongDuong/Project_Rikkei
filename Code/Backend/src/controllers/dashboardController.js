const dashboardService = require('../services/dashboardService');

class DashboardController {
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

    async getDashboardStatistics(req, res) {
        try {
            const { id: userId, role: userRole } = req.user;
            const statistics = await dashboardService.getDashboardStatistics(userId, userRole);

            return this.sendSuccess(
                res,
                200,
                'Lấy thống kê dashboard thành công!',
                statistics
            );
        } catch (error) {
            return this.sendError(res, 500, error.message || 'Lỗi server khi lấy thống kê dashboard.');
        }
    }

    async getRecentActivities(req, res) {
        try {
            const { id: userId, role: userRole } = req.user;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const activities = await dashboardService.getRecentActivities(userId, userRole, limit);

            return this.sendSuccess(
                res,
                200,
                'Lấy hoạt động gần đây thành công!',
                activities
            );
        } catch (error) {
            return this.sendError(res, 500, error.message || 'Lỗi server khi lấy hoạt động gần đây.');
        }
    }
}

module.exports = new DashboardController();
