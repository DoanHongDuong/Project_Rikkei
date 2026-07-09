const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const transporter = require('../config/mail');

const ACCESS_TOKEN_EXPIRES_IN = '1h';
const RESET_PASSWORD_TOKEN_EXPIRES_IN = '15m';

class AuthService {
  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    // Tìm kiếm user dựa vào email đã chuẩn hóa
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng.');
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === 'DISABLED') {
      throw new Error('Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
    }

    // Xác thực mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không đúng.');
    }

    // Cập nhật thời gian đăng nhập gần nhất
    await user.update({ last_login_at: new Date() });

    // Ký sinh mã Token xác thực JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    return { token, user };
  }

  async forgotPassword(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    // Trả về 200 giả định để bảo mật hệ thống (Tránh dò quét email có tồn tại hay không)
    if (!user || user.status === 'DISABLED') {
      return; // Không ném lỗi để giả lập thành công
    }

    const token = jwt.sign(
      { id: user.id, type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '[HTQLCV] Đặt lại mật khẩu',
      html: `<p>Xin chào ${user.full_name || ''},</p>
             <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào liên kết bên dưới để đặt lại mật khẩu. Liên kết có hiệu lực trong 15 phút.</p>
             <p><a href="${resetUrl}">Đặt lại mật khẩu</a></p>
             <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>`
    };

    await transporter.sendMail(mailOptions);
  }

  async resetPassword(token, newPassword) {
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn.');
    }

    if (payload.type !== 'reset') throw new Error('Token không hợp lệ.');

    const user = await User.findByPk(payload.id);
    if (!user) throw new Error('Người dùng không tồn tại.');
    if (user.status === 'DISABLED') {
      throw new Error('Tài khoản đã bị vô hiệu hóa. Không thể đặt lại mật khẩu.');
    }

    // Chặn Token cũ nếu mật khẩu đã được cập nhật trước đó
    if (user.password_changed_at) {
      const changedAtSeconds = Math.floor(new Date(user.password_changed_at).getTime() / 1000);
      if (payload.iat && changedAtSeconds > payload.iat) {
        throw new Error('Token đã bị hủy bỏ do thay đổi mật khẩu gần đây.');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await user.update({ password_hash, password_changed_at: new Date() });
  }
}

module.exports = new AuthService();
