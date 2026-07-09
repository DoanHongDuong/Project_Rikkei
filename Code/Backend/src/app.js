const express = require('express');
const http = require('http');
const socketService = require('./services/socketService');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');

// --- Import API Routes (Gộp tất cả lên đầu trang) ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const departmentRoutes = require("./routes/departmentRoutes");
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const commentRoutes = require('./routes/commentRoutes');
const extensionRoutes = require('./routes/extensionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Inline route cho /api/users (dùng chung cho ADMIN + PM)
const { verifyToken } = require('./middleware/authMiddleware');
const { authorizeRoles } = require('./middleware/roleMiddleware');
const userService = require('./services/userService');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { validate } = require('./middleware/validateMiddleware');
const { changePasswordSchema } = require('./validators/authValidator');

const app = express();

// --- Cấu hình CORS (Chỉ giữ lại 1 bản tối ưu nhất, hỗ trợ cả .env) ---
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

app.use(express.json());

// Kết nối Cơ sở dữ liệu
connectDB();

// --- Định nghĩa các API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/departments", departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', roadmapRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', commentRoutes);
app.use('/api/extensions', extensionRoutes);
app.use('/api/notifications', notificationRoutes);

// Route dùng chung: ADMIN + PM có thể lấy danh sách user để assign thành viên dự án
app.get('/api/users', verifyToken, authorizeRoles('ADMIN', 'PM'), async (req, res) => {
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
});

// Route lấy danh sách user để assign (loại bỏ ADMIN)
app.get('/api/available-users', verifyToken, authorizeRoles('ADMIN', 'PM', 'MEMBER'), async (req, res) => {
    try {
        const filters = { ...req.query, limit: 100, status: 'ACTIVE', exclude_role: 'ADMIN' };
        if (req.user.role === 'PM') {
            filters.department_id = req.user.department_id;
        }
        if (req.query.exclude_project_id) {
            const ProjectMember = require('./models/ProjectMember');
            const projectMembers = await ProjectMember.findAll({
                where: { project_id: req.query.exclude_project_id, is_active: true },
                attributes: ['user_id']
            });
            filters.exclude_user_ids = projectMembers.map(m => m.user_id);
        }
        const { users, pagination } = await userService.getUsers(filters);
        res.status(200).json({ success: true, message: 'OK', data: { users, pagination } });
    } catch (error) {
        console.error('GET /api/available-users error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// Route lấy thông tin profile của user đăng nhập
app.get('/api/users/profile', verifyToken, async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);
        res.status(200).json({ success: true, message: 'OK', data: user });
    } catch (error) {
        console.error('GET /api/users/profile error:', error);
        res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// Route cập nhật thông tin profile của user đăng nhập
app.put('/api/users/profile', verifyToken, async (req, res) => {
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
});

// Route đổi mật khẩu của user đăng nhập
app.put('/api/profile/change-password', verifyToken, validate({ body: changePasswordSchema }), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({
            password_hash: hashedPassword,
            password_changed_at: new Date()
        });

        return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        console.error('PUT /api/profile/change-password error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi đổi mật khẩu.' });
    }
});

// Route kiểm tra mặc định khi vào trang chủ server
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TMS Project Backend Server!" });
});

// --- Khởi chạy Server (Chỉ giữ lại 1 block duy nhất ở cuối trang) ---
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
socketService.init(server);

server.listen(PORT, () => {
    console.log(`Server đang chạy mượt mành tại cổng: http://localhost:${PORT}`);
});