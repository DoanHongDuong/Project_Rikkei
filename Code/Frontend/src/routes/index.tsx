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
import ProtectedRoute from './ProtectedRoute';
import UserManagement from '../pages/Users/UserManagement';
import CreateUser from '../pages/Users/CreateUser';
import UserInfo from '../pages/Users/UserInfo';
import EditUser from '../pages/Users/EditUser';
import PMUsersPage from '../pages/Users/PMUsersPage';
import DepartmentsPage from '../pages/Departments';
import PMDepartmentsPage from '../pages/Departments/PMDepartmentsPage';
import AuthService from '../services/authService';

import AdminDashboardPage from '../pages/Dashboard/AdminDashboardPage';

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
  // Only PM has the specific create page for now, if others they can be routed to forbidden or default
  if (user?.role === 'PM') return <PMCreateProjectPage />;
  return <ForbiddenPage />; 
};

const DepartmentsRoute = () => {
  const user = AuthService.getUser();
  if (user?.role === 'PM') return <PMDepartmentsPage />;
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
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'MEMBER']}>
              <DashboardRoute />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-tasks" 
          element={
            <ProtectedRoute allowedRoles={['MEMBER']}>
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
        <Route 
          path="/departments" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PM']}>
              <DepartmentsRoute />
            </ProtectedRoute>
          } 
        />
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