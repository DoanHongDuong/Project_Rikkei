const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
        }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }
    if (user.status === "DISABLED") {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
        message: "Đăng nhập thành công.",
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
        }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình đăng nhập." });
  }
};
// Thêm hàm register này vào file authController.js của bạn
const register = async (req, res) => {
    try {
        const { full_name, email, password, role, department_id } = req.body;

        // Mã hóa mật khẩu bằng bcryptjs
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Tạo user mới trong Database
        const newUser = await User.create({
            full_name,
            email,
            password_hash,
            role: role || 'MEMBER',
            status: 'ACTIVE',
            department_id: department_id || 1
        });

        return res.status(201).json({
            message: 'Đăng ký tài khoản thành công!',
            user: { id: newUser.id, email: newUser.email }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi đăng ký: ' + error.message });
    }
};

const logout = async (req, res) => {
    try {
        return res.status(200).json({ message: 'Đăng xuất hệ thống thành công!' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi hệ thống khi đăng xuất' });
    }
};
module.exports = { login, register, logout };