import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/authLayout';
import LoginPage from '../pages/Auth/LoginPage';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import MyTasksPage from '../pages/MyTasks';
import PMDashboardPage from '../pages/Dashboard/PMDashboardPage';
import ProjectsPage from '../pages/Projects';
import PMProjectsPage from '../pages/Projects/PMProjectsPage';
import PMCreateProjectPage from '../pages/Projects/PMCreateProjectPage';
import ProjectDetail from '../pages/ProjectDetail';
import ProjectMemberInfo from '../pages/ProjectDetail/ProjectMemberInfo';
import ForbiddenPage from '../pages/Error/ForbiddenPage';
import AdminUsersPage from '../pages/AdminUsers/AdminUsersPage';
import ProtectedRoute from './ProtectedRoute';
import UserManagement from '../pages/Users/UserManagement';
import CreateUser from '../pages/Users/CreateUser';
import UserInfo from '../pages/Users/UserInfo';
import EditUser from '../pages/Users/EditUser';
import PMUsersPage from '../pages/Users/PMUsersPage';
import DepartmentsPage from '../pages/Departments';
import PMDepartmentsPage from '../pages/Departments/PMDepartmentsPage';
import AuthService from '../services/authService';
import NotificationsPage from '../pages/Notifications';

import ProfilePage from '../pages/Profile/ProfilePage';

import AdminDashboardPage from '../pages/Dashboard/AdminDashboardPage';
import SettingsPage from '../pages/Settings/SettingsPage';

const DashboardRoute = () => {
  const user = AuthService.getUser();
  if (user?.role === 'PM') return <PMDashboardPage />;
  if (user?.role === 'ADMIN') return <AdminDashboardPage />;
  return <DashboardPage />;
};

const ProjectsRoute = () => {
  const user = AuthService.getUser();
  if (user?.role === 'PM') return <PMProjectsPage />;
  return <ProjectsPage />;
};

const CreateProjectRoute = () => {
  const user = AuthService.getUser();
  if (user?.role === 'PM') return <PMCreateProjectPage />;
  return <ForbiddenPage />; 
};

const DepartmentsRoute = () => {
  return <DepartmentsPage />;
};

const UsersRoute = () => {
  const user = AuthService.getUser();
  if (user?.role === 'PM') return <PMUsersPage />;
  return <UserManagement />;
};

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
        
        {/* Trang Bảng điều khiển */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <DashboardRoute />
            </ProtectedRoute>
          } 
        />

        {/* Trang Quản trị viên quản lý danh sách user nội bộ */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* Quản lý dự án */}
        <Route 
          path="/my-tasks" 
          element={
            <ProtectedRoute allowedRoles={['PM', 'MEMBER']}>
              <MyTasksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <ProjectsRoute />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects/create" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM']}>
              <CreateProjectRoute />
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
          path="/projects/:projectId/members/:memberId" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <ProjectMemberInfo />
            </ProtectedRoute>
          } 
        />

        {/* Quản lý Phòng ban / Bộ phận */}
        <Route 
          path="/departments" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DepartmentsRoute />
            </ProtectedRoute>
          } 
        />

        {/* Phân hệ thông tin thành viên tổng quan */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <UsersRoute />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users/create" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM']}>
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
            <ProtectedRoute allowedRoles={['ADMIN', 'PM']}>
              <EditUser />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />

        {/* Trang thông báo */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Trang thông tin cá nhân */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Bẫy tất cả các URL lạ không tồn tại về trang lỗi 403 */}
        <Route path="*" element={<Navigate to="/403" replace />} />
      </Routes>
    </BrowserRouter>
  );
}