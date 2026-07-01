import { useState, useEffect } from 'react';
import { Typography, Input, Select, Button, Form, Row, Col, Space, Avatar, message, Spin } from 'antd';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import AuthService from '../../services/authService';
import UserService from '../../services/userService';
import DepartmentService from '../../services/departmentService';

const { Title, Text } = Typography;

export default function EditUser() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  const currentUser = AuthService.getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [userRes, deptRes] = await Promise.all([
          UserService.getUserById(id),
          DepartmentService.getAll()
        ]);

        if (deptRes && deptRes.success) {
          setDepartments(deptRes.data);
        }

        if (userRes && userRes.data) {
          const user = userRes.data;
          form.setFieldsValue({
            name: user.full_name,
            email: user.email,
            role: user.role,
            status: user.status,
            department_id: user.department_id,
            id: user.id
          });
        }
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form]);

  const onFinish = async (values: any) => {
    if (!id) return;
    setLoading(true);
    try {
      // Map 'name' back to 'full_name' for backend
      const updateData = {
        full_name: values.name,
        email: values.email,
        role: values.role,
        department_id: values.department_id
      };
      await UserService.updateUser(id, updateData);
      message.success('Cập nhật thông tin nhân sự thành công');
      navigate('/users');
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px', borderRadius: 8 }}>
      <Space align="center" style={{ marginBottom: 32 }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ fontWeight: 600, paddingLeft: 0 }}
        >
          Trở lại
        </Button>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Sửa thông tin nhân sự
        </Title>
      </Space>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <Avatar
          size={120}
          icon={<UserOutlined />}
          style={{ backgroundColor: '#f0f0f0', color: '#8c8c8c' }}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label={<Text strong>Họ và tên</Text>}
          name="name"
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="Nhập tên" size="large" />
        </Form.Item>

        <Form.Item
          label={<Text strong>Email</Text>}
          name="email"
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="Nhập email" size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Vai trò</Text>}
              name="role"
              style={{ marginBottom: 16 }}
            >
              <Select
                size="large"
                disabled={!isAdmin}
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
              label={<Text strong>ID</Text>}
              name="id"
              style={{ marginBottom: 16 }}
            >
              <Input size="large" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Phòng ban</Text>}
              name="department_id"
              style={{ marginBottom: 16 }}
            >
              <Select
                size="large"
                disabled={!isAdmin}
                allowClear
                options={departments.map(d => ({
                  value: d.id,
                  label: d.name
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            {/* Đã gỡ bỏ phần Trạng thái theo yêu cầu */}
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              fontWeight: 600,
              padding: '0 32px',
              height: 40,
              borderRadius: 6
            }}
          >
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </div>
  );
}
