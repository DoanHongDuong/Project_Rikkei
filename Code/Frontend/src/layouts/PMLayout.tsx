import type { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BellFilled } from '@ant-design/icons';
import { Dropdown, Space, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AuthService from '../services/authService';
import '../pages/Dashboard/PMStyles.css';

interface PMLayoutProps {
  children: ReactNode;
}

export default function PMLayout({ children }: PMLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = AuthService.getUser();
  const userRole = user?.role || 'PM';

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  const userMenu = {
    items: [
      { key: 'profile', label: 'Profile' },
      { key: 'settings', label: 'Settings' },
      { type: 'divider' } as const,
      { key: 'logout', label: <a href="#logout" onClick={handleLogout}>Logout</a> },
    ]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <header className="pm-layout-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo.png" alt="ALL PERFECT" className="pm-logo" style={{ marginRight: '60px' }} />
          
          <nav className="pm-nav">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `pm-nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/projects" 
              className={({ isActive }) => `pm-nav-link ${isActive ? 'active' : ''}`}
            >
              Dự án
            </NavLink>
            <NavLink 
              to="/departments" 
              className={({ isActive }) => `pm-nav-link ${isActive ? 'active' : ''}`}
            >
              Phòng ban
            </NavLink>
            <NavLink 
              to="/users" 
              className={({ isActive }) => `pm-nav-link ${isActive ? 'active' : ''}`}
            >
              Nhân sự
            </NavLink>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <BellFilled className="pm-bell-icon" />
          
          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#2563EB' }} icon={<UserOutlined />} />
              <span style={{ fontWeight: 500 }}>{user?.full_name || 'User'}</span>
            </Space>
          </Dropdown>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}
