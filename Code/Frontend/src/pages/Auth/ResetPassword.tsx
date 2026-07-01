import { useState, useEffect } from 'react';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_MESSAGES, API_ROUTES, APP_ROUTES } from '../../constants/authMessages';
import './AuthDes.css';

interface ApiErrorResponse {
  message?: string;
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
  }, []);

  const apiBase = 'http://localhost:5000';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsError(false);

    if (!token) {
      setIsError(true);
      setStatus(AUTH_MESSAGES.TOKEN_MISSING);
      return;
    }

    if (!password || !confirmPassword) {
      setIsError(true);
      setStatus(AUTH_MESSAGES.PASSWORD_REQUIRED);
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setStatus(AUTH_MESSAGES.PASSWORD_MIN_LENGTH);
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setStatus(AUTH_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${apiBase}${API_ROUTES.RESET_PASSWORD}/${encodeURIComponent(token)}`,
        { password }
      );

      setStatus(response.data?.message || AUTH_MESSAGES.RESET_SUCCESS);
      setIsError(false);
      setTimeout(() => {
        navigate(APP_ROUTES.LOGIN, { replace: true });
      }, 2200);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setIsError(true);
      setStatus(axiosError.response?.data?.message || AUTH_MESSAGES.RESET_ERROR_DEFAULT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-des-page">
      <div className="index-1 reset-page">
        <form className="reset-wrap" onSubmit={handleSubmit}>
          <h1 className="reset-title text-black">Reset your password</h1>

          {status && (
            <div className={`status-message ${isError ? 'status-error' : 'status-success'}`}>
              {status}
            </div>
          )}

          <div className="reset-field">
            <p className="reset-label text-black">New password</p>
            <div className="passwordbox-21">
              <input
                type={showPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="reset-field">
            <p className="reset-label text-black">Confirm password</p>
            <div className="passwordbox-21">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <img
                  src={showConfirmPassword ? '/images/eyebrow.png' : '/images/eye-open.svg'}
                  alt={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                />
              </button>
            </div>
          </div>

          <button type="submit" className="loginbtn-24 reset-confirm-btn" disabled={loading}>
            <span className="text-25 text-black">{loading ? 'Processing...' : 'Confirm'}</span>
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
        </div>
      </div>
    </div>
  );
}
