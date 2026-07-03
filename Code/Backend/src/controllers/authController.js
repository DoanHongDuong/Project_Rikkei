const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const transporter = require("../config/mail");

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const RESET_PASSWORD_TOKEN_EXPIRES_IN = "15m";
const MIN_PASSWORD_LENGTH = 6;

// [POST] Đăng nhập hệ thống
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Tìm kiếm user dựa vào email đã chuẩn hóa
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === "DISABLED") {
      return res.status(403).json({ 
        message: "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị viên." 
      });
    }

    // Xác thực mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    // Cập nhật thời gian đăng nhập gần nhất
    await user.update({ last_login_at: new Date() });

    // Ký sinh mã Token xác thực JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công.",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình đăng nhập." });
  }
};

// [POST] Đăng xuất hệ thống
const logout = async (req, res) => {
  try {
    return res.status(200).json({ message: 'Đăng xuất hệ thống thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi hệ thống khi đăng xuất' });
  }
};

// [POST] Yêu cầu cấp Token quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email là bắt buộc." });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    // Trả về 200 giả định để bảo mật hệ thống (Tránh dò quét email có tồn tại hay không)
    if (!user || user.status === "DISABLED") {
      return res.status(200).json({ message: "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
    }

    const token = jwt.sign(
      { id: user.id, type: "reset" },
      process.env.JWT_SECRET,
      { expiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "[HTQLCV] Đặt lại mật khẩu",
      html: `<p>Xin chào ${user.full_name || ""},</p>
             <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào liên kết bên dưới để đặt lại mật khẩu. Liên kết có hiệu lực trong 15 phút.</p>
             <p><a href="${resetUrl}">Đặt lại mật khẩu</a></p>
             <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ message: "Không thể gửi email đặt lại mật khẩu." });
  }
};

// [POST] Đặt lại mật khẩu mới với Token từ URL
const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    if (!token) return res.status(400).json({ message: "Token là bắt buộc." });
    if (!password) return res.status(400).json({ message: "Mật khẩu mới là bắt buộc." });
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.` });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }

    if (payload.type !== "reset") return res.status(400).json({ message: "Token không hợp lệ." });

    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại." });
    if (user.status === "DISABLED") {
      return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa. Không thể đặt lại mật khẩu." });
    }

    // Chặn Token cũ nếu mật khẩu đã được cập nhật trước đó
    if (user.password_changed_at) {
      const changedAtSeconds = Math.floor(new Date(user.password_changed_at).getTime() / 1000);
      if (payload.iat && changedAtSeconds > payload.iat) {
        return res.status(400).json({ message: "Token đã bị hủy bỏ do thay đổi mật khẩu gần đây." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await user.update({ password_hash, password_changed_at: new Date() });

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Lỗi khi đặt lại mật khẩu." });
  }
};

// --- Đã dọn sạch hàm register khỏi danh sách xuất bản ---
module.exports = { login, logout, forgotPassword, resetPassword };