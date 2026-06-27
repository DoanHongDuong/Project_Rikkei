import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/authService';
import MainLayout from '../layouts/mainLayout'; 

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = AuthService.getUser();
  const userRole = user?.role;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/403" replace />;
    }
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}