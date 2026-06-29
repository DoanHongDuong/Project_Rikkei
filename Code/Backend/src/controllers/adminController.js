const userService = require('../services/userService');

class AdminController {
    // Xử lý API: Tạo người dùng mới
    async createNewUser(req, res) {
        try {
            const newUser = await userService.createUser(req.body);
            return res.status(201).json({
                message: 'Tạo tài khoản nhân viên thành công!',
                user: {
                    id: newUser.id,
                    full_name: newUser.full_name,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    // Xử lý API: Lấy danh sách & Tìm kiếm người dùng
    async getAllUsersList(req, res) {
        try {
            const search = req.query.search || ''; // Lấy keyword từ URL dạng ?search=abc
            const users = await userService.getAllUsers(search);
            return res.status(200).json({
                message: 'Lấy danh sách người dùng thành công!',
                count: users.length,
                data: users
            });
        } catch (error) {
            console.error("❌ LỖI THỰC TẾ TRÊN TERMINAL:", error); // Dòng này cực kỳ quan trọng
            return res.status(500).json({ message: 'Lỗi server khi lấy danh sách user.' });
        }
    }
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params; // Lấy số 7 từ URL xuống
            const updatedUser = await userService.updateUser(id, req.body);

            return res.status(200).json({
                message: 'Cập nhật trạng thái người dùng thành công!',
                user: {
                    id: updatedUser.id,
                    full_name: updatedUser.full_name,
                    status: updatedUser.status
                }
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params; // Lấy số 7 từ URL xuống
            await userService.deleteSoftUser(id);
            return res.status(200).json({
                message: 'Người dùng đã bị vô hiệu hóa và xóa mềm thành công!'
            });
        } catch (error) {
            return res.status(400).json({ sucess: false, message: error.message });
        }
    }
}

module.exports = new AdminController();