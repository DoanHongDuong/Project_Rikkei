import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, message } from 'antd';
// Import hằng số để thay thế magic string
import { AUTH_MESSAGES, API_ROUTES, APP_ROUTES } from '../../constants/authMessages';

export default function ResetPassword() {
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    console.log("👉 Token nhặt được từ URL Email là:", t);
    setToken(t);
  }, []);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const onFinish = async (values: any) => {
    setStatus(null);
    setIsError(false);

    if (!token) {
      setIsError(true);
      return setStatus(AUTH_MESSAGES.TOKEN_MISSING); 
    }

    setLoading(true);

    try {
        const resp = await axios.post(`${apiBase}${API_ROUTES.RESET_PASSWORD}/${encodeURIComponent(token)}`, { 
        password: values.password 
      });
      
      setIsError(false);
      const successMsg = resp.data?.message || AUTH_MESSAGES.RESET_SUCCESS;
      setStatus(successMsg);
      
      message.success(AUTH_MESSAGES.RESET_SUCCESS); 
      setTimeout(() => {
        navigate(APP_ROUTES.LOGIN, { replace: true }); 
      }, 2500);

    } catch (err: any) {
      setIsError(true);
      setStatus(err?.response?.data?.message || AUTH_MESSAGES.RESET_ERROR_DEFAULT); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card title="Đặt lại mật khẩu mới" style={{ width: 420, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        
        {status && (
          <Alert
            message={status}
            type={isError ? 'error' : 'success'}
            showIcon
            style={{ marginBottom: '1.5rem' }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          {/* Trường Mật khẩu mới */}
          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[
              { required: true, message: AUTH_MESSAGES.PASSWORD_REQUIRED }, // Thay thế Magic String
              { min: 6, message: AUTH_MESSAGES.PASSWORD_MIN_LENGTH } // Thay thế Magic String
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
          </Form.Item>

          {/* Trường Xác nhận mật khẩu */}
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: AUTH_MESSAGES.CONFIRM_REQUIRED }, // Thay thế Magic String
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(AUTH_MESSAGES.PASSWORD_MISMATCH)); // Thay thế Magic String
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}