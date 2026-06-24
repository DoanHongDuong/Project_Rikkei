import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate để điều hướng
import { Form, Input, Button, Card, Alert, message } from 'antd'; // Đồng bộ Ant Design

export default function ResetPassword() {
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 2. Khai báo hook điều hướng

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    setToken(t);
  }, []);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Hàm xử lý khi submit Form của Antd
  const onFinish = async (values: any) => {
    setStatus(null);
    setIsError(false);

    if (!token) {
      setIsError(true);
      return setStatus('Token không tồn tại hoặc đã hết hạn.');
    }

    setLoading(true);

    try {
      const resp = await axios.post(`${apiBase}/api/auth/reset-password/${encodeURIComponent(token)}`, { 
        password: values.password 
      });
      
      setIsError(false);
      setStatus(resp.data?.message || 'Đặt lại mật khẩu thành công.');
      
      // 3. HIỆN THÔNG BÁO POPUP VÀ TỰ ĐỘNG CHUYỂN TRANG SAU 2.5 GIÂY
      message.success('Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);

    } catch (err: any) {
      setIsError(true);
      setStatus(err?.response?.data?.message || 'Lỗi khi đặt lại mật khẩu.');
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
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
          </Form.Item>

          {/* Trường Xác nhận mật khẩu */}
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirm"
            dependencies={['password']} // Lắng nghe thay đổi của ô password ở trên
            rules={[
              { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
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