import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/authLayout';
import LoginPage from '../pages/Auth/LoginPage';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import DashboardPage from '../pages/Dashboard/DashboardPage'; // Quản trị Admin
import MemberDashboard from '../pages/Dashboard/MemberDashboard'; // Giao diện Member vẽ tay mới tạo
import UserManagementPage from '../pages/Dashboard/UserManagementPage'; // Quản lý nhân sự Admin
import ProtectedRoute from './ProtectedRoute';
import AuthService from '../services/authService';
import DepartmentManagementPage from "../pages/Dashboard/DepartmentManagementPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= 1. NHÓM TRANG PUBLIC (Sử dụng AuthLayout) ================= */}
        <Route element={<AuthLayout />}>
          {/* Dùng HomeRedirect để check token & role, tự động chuyển đúng Dashboard */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
        </Route>

        {/* ================= 2. NHÓM TRANG BẢO MẬT (Yêu cầu đăng nhập & phân quyền) ================= */}

        {/* Cổng 1: Màn hình chính tổng quan của ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Cổng 2: Màn hình CRUD Quản lý nhân sự của ADMIN */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage onBack={() => window.history.back()} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DepartmentManagementPage onBack={() => window.history.back()} />
            </ProtectedRoute>
          }
        />

        {/* Cổng 3: Màn hình công việc "My jb" và Biểu đồ tiến độ của MEMBER & PM */}
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute allowedRoles={['MEMBER', 'PM']}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* Bẫy tất cả các đường dẫn sai hoặc không tồn tại, đá về trang Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Component phụ trợ: Tự động tính toán để chuyển hướng khi người dùng gõ URL gốc "/"
 *
 * FIX: Dùng AuthService thay vì đọc localStorage trực tiếp để đúng key 'authToken'
 * FIX: Normalize role về uppercase để tránh mismatch với backend ('admin' vs 'ADMIN')
 */
function HomeRedirect() {
  const token = AuthService.getToken(); // ✅ đọc đúng key 'authToken'
  const user = AuthService.getUser();   // ✅ đọc đúng key 'user'

  // Nếu chưa đăng nhập, bắt buộc quay về form login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role về uppercase để khớp dù backend trả 'admin' hay 'ADMIN'
  const role = user?.role?.toUpperCase();

  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // MEMBER, PM và các role khác → Dashboard công việc riêng
  return <Navigate to="/member/dashboard" replace />;
}
