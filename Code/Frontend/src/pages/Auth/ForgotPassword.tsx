import { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Card, Alert } from 'antd'; 
import { Link } from 'react-router-dom'; 

export default function ForgotPassword() {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false); 

  // Lấy API URL từ cấu hình môi trường của bạn
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Hàm xử lý Form của Antd (values sẽ tự động gom { email: '...' })
  const onFinish = async (values: { email: string }) => {
    setMessage(null);
    setIsError(false);
    setLoading(true);

    try {
      const response = await axios.post(`${apiBase}/api/auth/forgot-password`, { 
        email: values.email 
      });
      setMessage(response.data?.message || 'Yêu cầu thành công! Vui lòng kiểm tra email.');
      setIsError(false);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Gửi liên kết đặt lại mật khẩu thất bại.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      {/* Bọc Form vào cấu trúc Card của Ant Design cho đẹp mắt */}
      <Card title="Quên mật khẩu" style={{ width: 440, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        
        {/* Khối hiển thị thông báo thành công / thất bại tự động bằng Alert */}
        {message && (
          <Alert
            message={message}
            type={isError ? 'error' : 'success'}
            showIcon
            style={{ marginBottom: '1.5rem' }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email tài khoản"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Định dạng email không hợp lệ!' }
            ]}
          >
            {/* Input của Antd tự động có hiệu ứng border xanh khi hover rất đẹp */}
            <Input placeholder="Nhập email của bạn" size="large" />
          </Form.Item>

          <Form.Item>
            {/* Button tự động chuyển sang trạng thái Loading xoay tròn nếu đang đợi API */}
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Gửi liên kết đặt lại
            </Button>
          </Form.Item>
        </Form>

        {/* Thêm link quay lại trang Login để cứu người dùng bấm nhầm */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login" style={{ color: '#2563eb' }}>
            ← Quay lại trang Đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}