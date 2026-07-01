import AuthService from './authService';
import type {
  AdminUser,
  ApiResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UserListFilters,
  UserPagination,
  UserStatus,
} from '../types/user-management';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UserListResult {
  users: AdminUser[];
  pagination: UserPagination;
}

class AdminUserService {
  private static getAuthHeaders(): HeadersInit {
    const token = AuthService.getToken();

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private static async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const result = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new Error(result.message || 'Request thất bại.');
    }

    return result;
  }

  static async getUsers(filters: UserListFilters): Promise<UserListResult> {
    const params = new URLSearchParams();

    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));

    if (filters.search) {
      params.set('search', filters.search);
    }

    if (filters.role) {
      params.set('role', filters.role);
    }

    if (filters.status) {
      params.set('status', filters.status);
    }

    if (filters.department_id) {
      params.set('department_id', String(filters.department_id));
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<AdminUser[]>(response);

    return {
      users: result.data,
      pagination: result.pagination || {
        page: filters.page,
        limit: filters.limit,
        totalItems: result.data.length,
        totalPages: 1,
      },
    };
  }

  static async getUserById(id: number): Promise<AdminUser> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<AdminUser>(response);
    return result.data;
  }

  static async createUser(payload: CreateUserPayload): Promise<AdminUser> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.parseResponse<AdminUser>(response);
    return result.data;
  }

  static async updateUser(id: number, payload: UpdateUserPayload): Promise<AdminUser> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.parseResponse<AdminUser>(response);
    return result.data;
  }

  static async updateUserStatus(id: number, status: UserStatus): Promise<AdminUser> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const result = await this.parseResponse<AdminUser>(response);
    return result.data;
  }
}

export default AdminUserService;
