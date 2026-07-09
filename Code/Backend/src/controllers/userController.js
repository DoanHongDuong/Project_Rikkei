const userService = require('../services/userService');

// [GET] Lấy danh sách user dùng chung cho ADMIN + PM
const getUsers = async (req, res) => {
    try {
        const filters = { ...req.query, limit: 100, status: 'ACTIVE' };
        if (req.user.role === 'PM') {
            filters.department_id = req.user.department_id;
        }
        const { users, pagination } = await userService.getUsers(filters);
        res.status(200).json({ success: true, message: 'OK', data: { users, pagination } });
    } catch (error) {
        console.error('GET /api/users error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// [GET] Lấy danh sách user để assign (loại bỏ ADMIN, hỗ trợ loại trừ những người đã trong project)
const getAvailableUsers = async (req, res) => {
    try {
        const filters = { ...req.query, limit: 100, status: 'ACTIVE', exclude_role: 'ADMIN' };
        if (req.user.role === 'PM') {
            filters.department_id = req.user.department_id;
        }
        if (req.query.exclude_project_id) {
            filters.exclude_user_ids = await userService.getExcludedProjectUserIds(req.query.exclude_project_id);
        }
        const { users, pagination } = await userService.getUsers(filters);
        res.status(200).json({ success: true, message: 'OK', data: { users, pagination } });
    } catch (error) {
        console.error('GET /api/available-users error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// [GET] Lấy thông tin profile của user đăng nhập
const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);
        res.status(200).json({ success: true, message: 'OK', data: user });
    } catch (error) {
        console.error('GET /api/users/profile error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// [PUT] Cập nhật thông tin profile của user đăng nhập
const updateProfile = async (req, res) => {
    try {
        const { full_name } = req.body;
        if (!full_name || !full_name.trim()) {
            return res.status(400).json({ success: false, message: 'Họ và tên không được bỏ trống.' });
        }
        const updatedUser = await userService.updateUser(req.user.id, { full_name });
        res.status(200).json({ success: true, message: 'Cập nhật thành công.', data: updatedUser });
    } catch (error) {
        console.error('PUT /api/users/profile error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// [PUT] Đổi mật khẩu của user đăng nhập
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await userService.changePassword(req.user.id, currentPassword, newPassword);
        return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        if (error.message === 'Người dùng không tồn tại.') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === 'Mật khẩu hiện tại không chính xác.') {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('PUT /api/profile/change-password error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi đổi mật khẩu.' });
    }
};

module.exports = {
    getUsers,
    getAvailableUsers,
    getProfile,
    updateProfile,
    changePassword
};
