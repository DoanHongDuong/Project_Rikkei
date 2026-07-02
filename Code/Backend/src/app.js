const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const app = express();

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));
app.use(express.json());

connectDB();
// API chạy thử nghiệm (Test Route)
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TMS Project Backend Server!" });
});
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
});
