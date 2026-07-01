import { useState } from 'react';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import './AuthDes.css';

interface ApiErrorResponse {
  message?: string;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiBase = 'http://localhost:5000';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsError(false);
    setLoading(true);

    try {
      const response = await axios.post(`${apiBase}/api/auth/forgot-password`, {
        email,
      });
      setMessage(response.data?.message || 'Yêu cầu thành công! Vui lòng kiểm tra email.');
      setIsError(false);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setMessage(axiosError.response?.data?.message || 'Gửi liên kết đặt lại mật khẩu thất bại.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-des-page">
      <div className="index-1">
        <form onSubmit={handleSubmit} className="login-form-14">
          <img src="/images/logo.png" className="logo" alt="Logo" />

          <div className="email-16">
            <p className="text-17">
              <span className="text-black">Email tài khoản</span>
            </p>
            <input
              id="email"
              type="email"
              className="emailbox-18"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {message && (
            <div className={`status-message ${isError ? 'status-error' : 'status-success'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="loginbtn-24" disabled={loading}>
            <span className="text-25 text-black">{loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}</span>
          </button>

          <p className="text-23">
            <Link to="/login" className="forgot-link">
              ← Quay lại trang Đăng nhập
            </Link>
          </p>
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
