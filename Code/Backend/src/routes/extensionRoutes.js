const express = require('express');
const router = express.Router();
const extensionController = require('../controllers/extensionController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Tất cả các route gia hạn deadline đều yêu cầu đăng nhập (verifyToken)
router.use(verifyToken);

// [POST] Gửi yêu cầu gia hạn deadline (Chỉ dành cho MEMBER - người thực hiện công việc)
router.post(
    '/',
    authorizeRoles('MEMBER'),
    (req, res) => extensionController.createRequest(req, res)
);

// [GET] Lấy danh sách yêu cầu gia hạn của bản thân (Chỉ dành cho MEMBER)
router.get(
    '/my',
    authorizeRoles('MEMBER'),
    (req, res) => extensionController.getMyRequests(req, res)
);

// [GET] Lấy danh sách yêu cầu gia hạn đang chờ duyệt (Dành cho PM và ADMIN)
router.get(
    '/pending',
    authorizeRoles('PM', 'ADMIN'),
    (req, res) => extensionController.getPendingRequests(req, res)
);

// [PUT] Phê duyệt yêu cầu gia hạn (Dành cho PM và ADMIN)
router.put(
    '/:id/approve',
    authorizeRoles('PM', 'ADMIN'),
    (req, res) => extensionController.approveRequest(req, res)
);

// [PUT] Từ chối yêu cầu gia hạn (Dành cho PM và ADMIN)
router.put(
    '/:id/reject',
    authorizeRoles('PM', 'ADMIN'),
    (req, res) => extensionController.rejectRequest(req, res)
);

module.exports = router;
