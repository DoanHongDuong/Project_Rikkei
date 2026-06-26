import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import './AuthDes.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-des-page">
      <div className="index-1">
        <form onSubmit={handleLogin} className="login-form-14">
          <img src="/images/logo.png" className="logo" alt="Logo" />

          <div className="email-16">
            <p className="text-17">
              <span className="text-black">Email/ID</span>
            </p>
            <input
              id="email"
              type="email"
              className="emailbox-18"
              placeholder="Enter email or ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="password-19">
            <p className="text-20">
              <span className="text-black">Password</span>
            </p>
            <div className="passwordbox-21">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <img
                  src={showPassword ? '/images/eyebrow.png' : '/images/eye-open.svg'}
                  alt={showPassword ? 'Hide password' : 'Show password'}
                />
              </button>
            </div>
            <p className="text-23">
              <Link to="/auth/forgot" className="forgot-link">
                Forgot password?
              </Link>
            </p>
          </div>

          {error && <div className="status-message status-error">{error}</div>}

          <button type="submit" className="loginbtn-24" disabled={loading}>
            <span className="text-25 text-black">{loading ? 'Processing...' : 'Login'}</span>
          </button>
        </form>

        <div className="contact-3">
          <div className="ctinfo-4">
            <p className="text-5">
              <span className="text-black">Have an issue? Better call us:</span>
            </p>
            <div className="phonenemail-6">
              <div className="phone-7">
                <img src="/images/vector-8.svg" className="vector-8" alt="Phone" />
                <p className="text-9">
                  <span className="text-black">0967676767</span>
                </p>
              </div>
              <div className="email-10">
                <img src="/images/vector-11.svg" className="vector-11" alt="Email" />
                <p className="text-12">
                  <span className="text-black">sadfghjk@asd.com</span>
                </p>
              </div>
            </div>
          </div>
          <div className="text-13">
            <Link to="/login" className="text-black">
              Manual
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
