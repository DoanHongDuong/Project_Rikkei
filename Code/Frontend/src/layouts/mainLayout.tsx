import type { ReactNode } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Breadcrumb, Space } from 'antd';
import {
  AppstoreOutlined,
  ProjectOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellFilled,
  CheckSquareOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = AuthService.getUser();
  const userRole = user?.role || 'MEMBER';

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

  const allMenuItems = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Dashboard', roles: ['ADMIN', 'PM', 'MEMBER'] },
    { key: '/my-tasks', icon: <CheckSquareOutlined />, label: 'My Tasks', roles: ['MEMBER'] },
    { key: '/projects', icon: <ProjectOutlined />, label: 'Projects', roles: ['ADMIN', 'PM', 'MEMBER'] },
    { key: '/departments', icon: <TeamOutlined />, label: 'Departments', roles: ['ADMIN'] },
    { key: '/users', icon: <UserOutlined />, label: 'Users', roles: ['ADMIN'] },
    { key: '/calendar', icon: <CalendarOutlined />, label: 'Calendar', roles: ['PM', 'MEMBER'] },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports', roles: ['ADMIN', 'PM'] },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings', roles: ['ADMIN'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // Basic breadcrumb logic based on path
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    return {
      title: <span style={{ textTransform: 'capitalize' }}>{pathSnippets[index]}</span>,
    };
  });

  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>
      <Sider
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: '#1E3A5F'
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #162D4A' }}>
          <h2 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>TMS</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ backgroundColor: '#1E3A5F', borderRight: 0, paddingTop: 16 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 240 }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            backgroundColor: '#FFFFFF',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Breadcrumb items={breadcrumbItems} style={{ marginRight: 32 }} />
          </div>
          <Space size="large" align="center">
            <Badge count={5} size="small">
              <BellFilled style={{ fontSize: 24, cursor: 'pointer', color: '#6B7280' }} />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#2563EB' }} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>{user?.full_name || 'User'} ({userRole})</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 24px', overflow: 'initial' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
