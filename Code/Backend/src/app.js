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
const userRoutes = require('./routes/userRoutes');

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
app.use('/api', userRoutes);

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