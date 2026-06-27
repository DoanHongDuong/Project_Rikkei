import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/authLayout';
import LoginPage from '../pages/Auth/LoginPage';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ProjectsPage from '../pages/Projects';
import ProjectDetail from '../pages/ProjectDetail';
import ForbiddenPage from '../pages/Error/ForbiddenPage';
import ProtectedRoute from './ProtectedRoute';
import UserManagement from '../pages/Users/UserManagement';
import CreateUser from '../pages/Users/CreateUser';
import UserInfo from '../pages/Users/UserInfo';
import EditUser from '../pages/Users/EditUser';
import DepartmentsPage from '../pages/Departments';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= 1. NHÓM TRANG PUBLIC (Sử dụng AuthLayout) ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
        </Route>

        <Route path="/403" element={<ForbiddenPage />} />

        {/* ================= 2. NHÓM TRANG BẢO MẬT (Yêu cầu đăng nhập) ================= */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <ProjectsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <ProjectDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/departments" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DepartmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/create" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <CreateUser />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <UserInfo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <EditUser />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/403" replace />} />
      </Routes>
    </BrowserRouter>
  );
}