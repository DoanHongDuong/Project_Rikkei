const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();

app.use(cors());
app.use(express.json()); 

connectDB();
// API chạy thử nghiệm (Test Route)
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TMS Project Backend Server!" });
});
app.use('/api/admin', adminRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
});
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));