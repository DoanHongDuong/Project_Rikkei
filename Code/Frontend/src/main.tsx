import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthService from './services/authService'

// Global Fetch Interceptor to handle 401/403
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  if (response.status === 401 || response.status === 403) {
    const clone = response.clone();
    try {
      const data = await clone.json();
      const messagesToLogout = [
        'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
        'Token không hợp lệ hoặc đã hết hạn!',
        'Tài khoản không tồn tại hoặc token không hợp lệ.',
        'Truy cập bị từ chối! Bạn chưa đăng nhập.'
      ];
      
      if (response.status === 401 || (data.message && messagesToLogout.includes(data.message))) {
        AuthService.logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } catch (e) {
      // Ignore parse error
    }
  }
  return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
