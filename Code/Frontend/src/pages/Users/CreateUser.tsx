import { useState, useEffect } from 'react';
import { Typography, Input, Select, Button, Form, Row, Col, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserService from '../../services/userService';
import DepartmentService from '../../services/departmentService';

const { Title, Text } = Typography;

export default function CreateUser() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await DepartmentService.getAll();
        if (response.success) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải phòng ban:', error);
      }
    };
    fetchDepartments();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await UserService.createUser({
        full_name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        department_id: values.department_id,
      });
      message.success('Tạo tài khoản thành công!');
      navigate('/users');
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tạo người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px', borderRadius: 8 }}>
      <Title level={2} style={{ marginTop: 0, marginBottom: 24, fontWeight: 700 }}>
        Thêm nhân sự mới
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={true}
      >
        <Form.Item
          label={<Text strong>Họ và tên</Text>}
          name="name"
          style={{ marginBottom: 16 }}
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input placeholder="Nhập họ và tên..." size="large" />
        </Form.Item>

        <Form.Item
          label={<Text strong>Email</Text>}
          name="email"
          style={{ marginBottom: 16 }}
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder="Nhập địa chỉ email..." size="large" />
        </Form.Item>

        <Form.Item
          label={<Text strong>Mật khẩu (Tùy chọn)</Text>}
          name="password"
          style={{ marginBottom: 16 }}
          help="Nếu để trống, mật khẩu mặc định sẽ là 123456"
        >
          <Input.Password placeholder="Nhập mật khẩu..." size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Vai trò</Text>}
              name="role"
              style={{ marginBottom: 16 }}
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select 
                placeholder="Chọn vai trò" 
                size="large"
                options={[
                  { value: 'MEMBER', label: 'Member' },
                  { value: 'PM', label: 'Project Manager' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Phòng ban</Text>}
              name="department_id"
              style={{ marginBottom: 16 }}
            >
              <Select 
                placeholder="Chọn phòng ban (Tùy chọn)" 
                size="large"
                allowClear
                options={departments.map(d => ({
                  value: d.id,
                  label: d.name
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Space size="middle">
            <Button 
              onClick={() => navigate('/users')}
              style={{ 
                fontWeight: 600,
                padding: '0 32px',
                height: 40,
                borderRadius: 6
              }}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              style={{ 
                fontWeight: 600,
                padding: '0 32px',
                height: 40,
                borderRadius: 6
              }}
            >
              Tạo mới
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
