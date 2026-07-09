export const AUTH_MESSAGES = {
  TOKEN_MISSING: 'Token không tồn tại hoặc đã hết hạn.',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 6 ký tự!',
  PASSWORD_REQUIRED: 'Vui lòng nhập mật khẩu mới!',
  CONFIRM_REQUIRED: 'Vui lòng xác nhận lại mật khẩu!',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp!',
  RESET_SUCCESS: 'Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...',
  RESET_ERROR_DEFAULT: 'Lỗi khi đặt lại mật khẩu.',
};

export const API_ROUTES = {
  RESET_PASSWORD: '/api/auth/reset-password',
};

export const APP_ROUTES = {
  LOGIN: '/login',
};