const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const departmentRoutes = require("./routes/departmentRoutes");
const app = express();

// CORS cấu hình 1 lần duy nhất, đặt TRƯỚC các route
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TMS Project Backend Server!" });
});
app.use('/api/admin', adminRoutes);
app.use("/api/departments", departmentRoutes);

const roadmapRoutes = require('./routes/roadmapRoutes');
app.use('/api', roadmapRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
});