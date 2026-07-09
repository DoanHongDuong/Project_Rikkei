const dashboardService = require('../services/dashboardService');

class DashboardController {
    // --- Hàm bổ trợ định dạng Response thành công ---
    sendSuccess(res, statusCode, message, data = null) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    // --- Hàm bổ trợ định dạng Response lỗi ---
    sendError(res, statusCode, message) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: null
        });
    }

    // [GET] Lấy dữ liệu dashboard cho Member
    async getMemberDashboard(req, res) {
        try {
            const userId = req.user.id;
            const metrics = await dashboardService.getMemberMetrics(userId);
            return this.sendSuccess(
                res,
                200,
                'Lấy dữ liệu dashboard thành viên thành công!',
                metrics
            );
        } catch (error) {
            console.error('getMemberDashboard error:', error);
            return this.sendError(res, 500, error.message);
        }
    }

    // [GET] Lấy dữ liệu dashboard cho PM
    async getPmDashboard(req, res) {
        try {
            const userId = req.user.id;
            const metrics = await dashboardService.getPmMetrics(userId);
            return this.sendSuccess(
                res,
                200,
                'Lấy dữ liệu dashboard PM thành công!',
                metrics
            );
        } catch (error) {
            console.error('getPmDashboard error:', error);
            return this.sendError(res, 500, error.message);
        }
    }
}

module.exports = new DashboardController();
