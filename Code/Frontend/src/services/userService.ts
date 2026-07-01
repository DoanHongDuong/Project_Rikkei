const API_BASE_URL = 'http://localhost:5000';

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
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'PUT',
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
}

export default UserService;
