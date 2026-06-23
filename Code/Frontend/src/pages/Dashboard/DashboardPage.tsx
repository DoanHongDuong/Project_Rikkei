import { useEffect, useState } from 'react';
import AuthService from '../../services/authService';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

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

// Thêm CSS inline hoặc tạo file DashboardPage.css
const styles = `
.dashboard-container {
  padding: 20px;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.dashboard-header h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.dashboard-header p {
  margin: 5px 0;
  font-size: 14px;
  opacity: 0.9;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.card p {
  margin: 0;
  color: #999;
  font-size: 14px;
}
`;
