const API_BASE_URL = import.meta.env.BACKEND_URL;

interface UserData {
  full_name: string;
  email: string;
  role: string;
  department_id?: number | null;
  password?: string;
  status?: string;
}

class UserService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getAllUsers(search: string = '') {
    try {
      const url = search
        ? `${API_BASE_URL}/api/admin/users?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/api/admin/users`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi tải danh sách người dùng');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(id: string | number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi lấy thông tin người dùng');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async createUser(data: UserData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi tạo người dùng');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async updateUserStatus(id: string | number, status: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi cập nhật trạng thái');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(id: string | number, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi cập nhật thông tin');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(id: string | number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi xóa người dùng');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getMyProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi lấy thông tin cá nhân');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async updateMyProfile(data: { full_name: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
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

  static async changePassword(data: any) {
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
}

export default UserService;
