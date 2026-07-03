const express = require('express');
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

// Inline route cho /api/users (dùng chung cho ADMIN + PM)
const { verifyToken } = require('./middleware/authMiddleware');
const { authorizeRoles } = require('./middleware/roleMiddleware');
const userService = require('./services/userService');

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

// Route kiểm tra mặc định khi vào trang chủ server
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TMS Project Backend Server!" });
});

// --- Khởi chạy Server (Chỉ giữ lại 1 block duy nhất ở cuối trang) ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
});