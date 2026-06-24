import type { ReactNode } from 'react';
import './mainLayout.css';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); 
    AuthService.logout(); 
    navigate('/login', { replace: true }); 
  };
  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="header-content">
          <h1>TMS - Task Management System</h1>
          <nav className="main-nav">
            <a href="/dashboard">Dashboard</a>
            <a href="/profile">Hồ sơ</a>
            <a href="#logout" onClick={handleLogout}>Đăng xuất</a>  
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
