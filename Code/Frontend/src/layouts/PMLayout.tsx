import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dropdown, Space, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AuthService from '../services/authService';
import TaskNotificationPopup from '../components/Notification/TaskNotificationPopup';
import NotificationDropdown from '../components/Notification/NotificationDropdown';
import { NotificationProvider } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import '../pages/Dashboard/PMStyles.css';

interface PMLayoutProps {
  children: ReactNode;
}

export default function PMLayout({ children }: PMLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  const userMenu = {
    items: [
      { key: 'profile', label: t('nav.profile') },
      { key: 'settings', label: <a href="#settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>{t('nav.settings')}</a> },
      { type: 'divider' } as const,
      { key: 'logout', label: <a href="#logout" onClick={handleLogout}>{t('nav.logout')}</a> },
    ]
  };

  return (
    <NotificationProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <header className="pm-layout-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#2563EB', marginRight: '60px', letterSpacing: '2px' }}>TMS</div>
            
            <nav className="pm-nav">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `pm-nav-link ${isActive ? 'active' : ''}`}
              >
                {t('nav.dashboard')}
              </NavLink>
              {(user?.role === 'MEMBER' || user?.role === 'PM') && (
                <NavLink 
                  to="/my-tasks" 
                  className={({ isActive }) => `pm-nav-link ${isActive ? 'active' : ''}`}
                >
                  {t('nav.tasks')}
                </NavLink>
              )}
              <NavLink 
                to="/projects" 
                className={({ isActive }) => `pm-nav-link ${isActive ? 'active' : ''}`}
              >
                {t('nav.projects')}
              </NavLink>
              {user?.role === 'PM' && (
                <NavLink 
                  to="/users" 
                  className={({ isActive }) => `pm-nav-link ${isActive ? 'active' : ''}`}
                >
                  {t('nav.users')}
                </NavLink>
              )}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <NotificationDropdown />
            
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#2563EB' }} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>{user?.full_name || 'User'}</span>
              </Space>
            </Dropdown>
          </div>
        </header>

        <main className="pm-dashboard-container">
          {children}
        </main>

        {/* Popup thông báo khi có task mới */}
        <TaskNotificationPopup />
      </div>
    </NotificationProvider>
  );
}
