const extensionService = require('../services/extensionService');

class ExtensionController {
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

    // [POST] Gửi yêu cầu gia hạn deadline
    async createRequest(req, res) {
        try {
            const { taskId, requestedDeadline, reason } = req.body;
            const requesterId = req.user.id;

            const result = await extensionService.createRequest(
                { taskId, requestedDeadline, reason },
                requesterId
            );

            return this.sendSuccess(
                res,
                201,
                'Gửi yêu cầu gia hạn thành công!',
                result
            );
        } catch (error) {
            console.error('createRequest error:', error);
            return this.sendError(res, error.statusCode || 500, error.message);
        }
    }

    // [POST/PUT] Phê duyệt yêu cầu gia hạn deadline
    async approveRequest(req, res) {
        try {
            const { id } = req.params;
            const reviewedByUserId = req.user.id;
            const { reviewNote } = req.body;

            const result = await extensionService.approveRequest(
                id,
                reviewedByUserId,
                reviewNote
            );

            return this.sendSuccess(
                res,
                200,
                'Phê duyệt yêu cầu gia hạn thành công!',
                result
            );
        } catch (error) {
            console.error('approveRequest error:', error);
            return this.sendError(res, error.statusCode || 500, error.message);
        }
    }

    // [POST/PUT] Từ chối yêu cầu gia hạn deadline
    async rejectRequest(req, res) {
        try {
            const { id } = req.params;
            const reviewedByUserId = req.user.id;
            const { reviewNote } = req.body;

            const result = await extensionService.rejectRequest(
                id,
                reviewedByUserId,
                reviewNote
            );

            return this.sendSuccess(
                res,
                200,
                'Từ chối yêu cầu gia hạn thành công!',
                result
            );
        } catch (error) {
            console.error('rejectRequest error:', error);
            return this.sendError(res, error.statusCode || 500, error.message);
        }
    }

    // [GET] Lấy danh sách yêu cầu gia hạn đang chờ duyệt (Dành cho PM/ADMIN)
    async getPendingRequests(req, res) {
        try {
            const requests = await extensionService.getPendingRequests(req.user);

            return this.sendSuccess(
                res,
                200,
                'Lấy danh sách yêu cầu gia hạn đang chờ duyệt thành công!',
                requests
            );
        } catch (error) {
            console.error('getPendingRequests error:', error);
            return this.sendError(res, error.statusCode || 500, error.message);
        }
    }

    // [GET] Lấy danh sách yêu cầu gia hạn của bản thân (Dành cho Member)
    async getMyRequests(req, res) {
        try {
            const requesterId = req.user.id;
            const requests = await extensionService.getMyRequests(requesterId);

            return this.sendSuccess(
                res,
                200,
                'Lấy danh sách yêu cầu gia hạn của bạn thành công!',
                requests
            );
        } catch (error) {
            console.error('getMyRequests error:', error);
            return this.sendError(res, error.statusCode || 500, error.message);
        }
    }
}

module.exports = new ExtensionController();
