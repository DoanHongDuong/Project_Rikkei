import type { ReactNode } from 'react';
import './mainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="header-content">
          <h1>TMS - Task Management System</h1>
          <nav className="main-nav">
            <a href="/dashboard">Dashboard</a>
            <a href="/profile">Hồ sơ</a>
            <a href="/logout">Đăng xuất</a>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
