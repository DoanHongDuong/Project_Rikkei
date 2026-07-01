import type { AuthUser } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MILLISECONDS_PER_SECOND = 1000;

interface JwtPayload {
  exp?: number;
}

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
    const token = this.getToken();

    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  // Lấy thông tin user từ localStorage
  static getUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      this.logout();
      return null;
    }
  }

  private static isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];

      if (!payloadBase64) {
        return true;
      }

      const payload = JSON.parse(atob(payloadBase64)) as JwtPayload;

      if (!payload.exp) {
        return true;
      }

      const currentTimeInSeconds = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
      return payload.exp <= currentTimeInSeconds;
    } catch {
      return true;
    }
  }
}

export default AuthService;
