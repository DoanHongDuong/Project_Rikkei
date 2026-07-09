const API_BASE_URL = import.meta.env.BACKEND_URL;

interface DepartmentData {
  name: string;
  description?: string;
}

class DepartmentService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Lấy tất cả phòng ban
  static async getAll(search: string = '') {
    try {
      const url = search 
        ? `${API_BASE_URL}/api/departments?search=${encodeURIComponent(search)}` 
        : `${API_BASE_URL}/api/departments`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi tải danh sách phòng ban');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách thành viên trong phòng ban
  static async getMembers(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${id}/members`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi tải danh sách thành viên');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Tạo mới
  static async create(data: DepartmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi tạo phòng ban');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật
  static async update(id: number, data: DepartmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi cập nhật phòng ban');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Xóa
  static async delete(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi xóa phòng ban');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default DepartmentService;
