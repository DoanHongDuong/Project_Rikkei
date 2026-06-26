import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/authService';
import MainLayout from '../layouts/mainLayout'; // Thêm dòng import này

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  if (!AuthService.isAuthenticated()) return <Navigate to="/login" replace />;
  
  if (allowedRoles && allowedRoles.length > 0) {
    const user = AuthService.getUser();
    // Lưu ý: API trả về role lowercase 'admin', routes dùng 'ADMIN'
    // Cần normalize để tránh mismatch
    const userRole = user?.role?.toUpperCase();
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <MainLayout>{children}</MainLayout>;
}