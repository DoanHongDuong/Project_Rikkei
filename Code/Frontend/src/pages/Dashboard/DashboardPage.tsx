import { useEffect, useState } from 'react';
import AuthService from '../../services/authService';
import type { AuthUser } from '../../types/auth';
import './Dashboard.css';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const userData = AuthService.getUser();
    setUser(userData);
  }, []);

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Chào mừng, {user.full_name}!</h2>
        <p>Email: {user.email}</p>
        <p>Vai trò: {user.role}</p>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h3>Dự án của tôi</h3>
          <p>Hiện chưa có dự án nào</p>
        </div>

        <div className="card">
          <h3>Các tác vụ</h3>
          <p>Hiện chưa có tác vụ nào</p>
        </div>

        <div className="card">
          <h3>Hoạt động gần đây</h3>
          <p>Không có hoạt động nào</p>
        </div>
      </div>
    </div>
  );
}
