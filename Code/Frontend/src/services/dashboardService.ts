import axios from 'axios';
import AuthService from './authService';

const API_BASE_URL = 'http://localhost:5000';

class DashboardService {
  static async getAdminDashboard() {
    try {
      const token = AuthService.getToken();
      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Lỗi khi tải dữ liệu dashboard');
      }
      throw new Error('Lỗi mạng hoặc server không phản hồi');
    }
  }
  static async getMemberDashboard() {
    try {
      const token = AuthService.getToken();
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/member`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Lỗi khi tải dữ liệu dashboard thành viên');
      }
      throw new Error('Lỗi mạng hoặc server không phản hồi');
    }
  }
  static async getPmDashboard() {
    try {
      const token = AuthService.getToken();
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/pm`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Lỗi khi tải dữ liệu dashboard PM');
      }
      throw new Error('Lỗi mạng hoặc server không phản hồi');
    }
  }
}

export default DashboardService;
