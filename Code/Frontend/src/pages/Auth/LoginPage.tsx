import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đăng Nhập</h1>
          <p className="auth-subtitle">Chào mừng bạn quay lại</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email hoặc ID
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <a href="/forgot-password" className="forgot-password-link">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="contact-info">
          <p className="contact-header">Có vấn đề? Liên hệ với chúng tôi:</p>
          <div className="contact-items">
            <div className="contact-item">
              <span>📞</span>
              <span>0967676767</span>
            </div>
            <div className="contact-item">
              <span>📧</span>
              <span>sadfghjk@asd.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
