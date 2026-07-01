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

const app = express();

// --- Cấu hình CORS (Chỉ giữ lại 1 bản tối ưu nhất, hỗ trợ cả .env) ---
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
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

// Route kiểm tra mặc định khi vào trang chủ server
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TMS Project Backend Server!" });
});

// --- Khởi chạy Server (Chỉ giữ lại 1 block duy nhất ở cuối trang) ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
});