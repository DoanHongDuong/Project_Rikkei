export type UserRole = 'ADMIN' | 'PM' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department_id: number | null;
  password_changed_at?: string | null;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface UserListFilters {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  department_id?: number | '';
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  department_id: number | null;
}

export interface UpdateUserPayload {
  full_name: string;
  email: string;
  role: UserRole;
  department_id: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: UserPagination;
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department_id: number | null;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
}

export interface UpdateProfilePayload {
  full_name: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

