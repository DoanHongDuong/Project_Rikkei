const API_BASE_URL = import.meta.env.BACKEND_URL;

import type { ApiResponse, UserProfile, UpdateProfilePayload, ChangePasswordPayload } from '../types/user-management';

class UserProfileService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Lấy thông tin cá nhân của người dùng đang đăng nhập
  static async getMyProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi tải thông tin cá nhân');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật họ tên của người dùng đang đăng nhập
  static async updateMyProfile(data: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi cập nhật thông tin cá nhân');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Thay đổi mật khẩu tài khoản đang đăng nhập
  static async changePassword(data: ChangePasswordPayload): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi thay đổi mật khẩu');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Upload avatar (Hiện tại Backend chưa hỗ trợ vì bảng users không có trường avatar và không có thư viện upload)
  static async uploadAvatar(_file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    throw new Error('Chức năng upload avatar chưa được Backend hỗ trợ.');
  }
}

export default UserProfileService;
