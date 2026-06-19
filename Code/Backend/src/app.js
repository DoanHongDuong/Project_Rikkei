const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json()); 

connectDB();

// API chạy thử nghiệm (Test Route)
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TMS Project Backend Server!" });
});

// CẤU HÌNH CỔNG CHẠY (BẮT BUỘC PHẢI CÓ ĐOẠN NÀY ĐỂ GIỮ SERVER LUÔN CHẠY)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
});
