import type { CreateExtensionRequestInput, ExtensionRequest } from '../types/extension';

const API_BASE_URL = import.meta.env.BACKEND_URL;

class ExtensionService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Gửi yêu cầu gia hạn deadline
  static async createRequest(data: CreateExtensionRequestInput): Promise<ExtensionRequest> {
    const response = await fetch(`${API_BASE_URL}/api/extensions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi gửi yêu cầu gia hạn');
    }
    const resData = await response.json();
    return resData.data;
  }

  // Lấy danh sách yêu cầu của bản thân (MEMBER)
  static async getMyRequests(): Promise<ExtensionRequest[]> {
    const response = await fetch(`${API_BASE_URL}/api/extensions/my`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải danh sách yêu cầu của bạn');
    }
    const resData = await response.json();
    return resData.data;
  }

  // Lấy danh sách yêu cầu chờ duyệt (PM/ADMIN)
  static async getPendingRequests(): Promise<ExtensionRequest[]> {
    const response = await fetch(`${API_BASE_URL}/api/extensions/pending`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải danh sách yêu cầu chờ duyệt');
    }
    const resData = await response.json();
    return resData.data;
  }

  // Phê duyệt yêu cầu gia hạn
  static async approveRequest(id: string | number, reviewNote?: string): Promise<ExtensionRequest> {
    const response = await fetch(`${API_BASE_URL}/api/extensions/${id}/approve`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reviewNote }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi phê duyệt yêu cầu');
    }
    const resData = await response.json();
    return resData.data;
  }

  // Từ chối yêu cầu gia hạn
  static async rejectRequest(id: string | number, reviewNote?: string): Promise<ExtensionRequest> {
    const response = await fetch(`${API_BASE_URL}/api/extensions/${id}/reject`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reviewNote }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi từ chối yêu cầu');
    }
    const resData = await response.json();
    return resData.data;
  }
}

export default ExtensionService;
