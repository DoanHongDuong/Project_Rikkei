const API_BASE_URL = 'http://localhost:5000';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role?: string;
  department_id?: number;
}

interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
}

class AuthService {
  // Đăng nhập
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
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

      const result = await response.json();
      
      // Lưu token vào localStorage
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Đăng ký
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Đăng ký thất bại');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
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
  static getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default AuthService;
