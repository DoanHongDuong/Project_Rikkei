import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/authLayout';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= 1. NHÓM TRANG PUBLIC (Sử dụng AuthLayout) ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
        </Route>

        {/* ================= 2. NHÓM TRANG BẢO MẬT (Yêu cầu đăng nhập) ================= */}
        {/* Bọc thẳng DashboardPage vào trong ProtectedRoute. 
          Bên trong ProtectedRoute của bạn đã tự động lồng <MainLayout> bọc quanh {children} rồi!
        */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* Sau này nếu đồng đội thêm trang nội bộ mới (ví dụ /projects), bạn cứ bọc tương tự: */}
        {/* <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } 
        /> 
        */}
      </Routes>
    </BrowserRouter>
  );
}