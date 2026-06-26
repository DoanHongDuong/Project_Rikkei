import type { AuthUser } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000';

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token?: string;
  user?: AuthUser;
}

class AuthService {
  // Đăng nhập
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const result: AuthResponse = await response.json();

    // Lưu token vào localStorage để ProtectedRoute kiểm tra trạng thái đăng nhập.
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  }

  // Đăng xuất
  static logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Lấy token từ localStorage
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Kiểm tra user đã đăng nhập chưa
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Lấy thông tin user từ localStorage
  static getUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default AuthService;
