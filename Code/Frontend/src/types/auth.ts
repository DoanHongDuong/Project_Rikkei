export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'PM' | 'MEMBER';
}
