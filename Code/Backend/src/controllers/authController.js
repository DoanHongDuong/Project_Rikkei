const authService = require('../services/authService');

const MIN_PASSWORD_LENGTH = 6;

// [POST] Đăng nhập hệ thống
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
    }

    const { token, user } = await authService.login(email, password);

    return res.status(200).json({
      message: 'Đăng nhập thành công.',
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
    if (
      error.message === 'Email hoặc mật khẩu không đúng.' ||
      error.message === 'Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
    ) {
      return res.status(error.message.includes('khóa') ? 403 : 401).json({ message: error.message });
    }
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình đăng nhập.' });
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
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc.' });

    await authService.forgotPassword(email);

    return res.status(200).json({ message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ message: 'Không thể gửi email đặt lại mật khẩu.' });
  }
};

// [POST] Đặt lại mật khẩu mới với Token từ URL
const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    
    if (!token) return res.status(400).json({ message: 'Token là bắt buộc.' });
    if (!password) return res.status(400).json({ message: 'Mật khẩu mới là bắt buộc.' });
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.` });
    }

    await authService.resetPassword(token, password);

    return res.status(200).json({ message: 'Đặt lại mật khẩu thành công.' });
  } catch (error) {
    if (
      error.message === 'Token không hợp lệ hoặc đã hết hạn.' ||
      error.message === 'Token không hợp lệ.' ||
      error.message === 'Token đã bị hủy bỏ do thay đổi mật khẩu gần đây.'
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Người dùng không tồn tại.') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Tài khoản đã bị vô hiệu hóa. Không thể đặt lại mật khẩu.') {
      return res.status(403).json({ message: error.message });
    }

    console.error('resetPassword error:', error);
    return res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu.' });
  }
};

module.exports = { login, logout, forgotPassword, resetPassword };