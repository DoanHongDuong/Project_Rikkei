import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/authService';
import MainLayout from '../layouts/mainLayout'; // Thêm dòng import này

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return AuthService.isAuthenticated() ? (
    <MainLayout>{children}</MainLayout> // Thêm thẻ bọc ở đây
  ) : (
    <Navigate to="/login" replace />
  );
}