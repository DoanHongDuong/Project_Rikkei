import { Typography, Input, Select, Button, Form, Row, Col, Space, Avatar } from 'antd';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import AuthService from '../../services/authService';

const { Title, Text } = Typography;

export default function EditUser() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const currentUser = AuthService.getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Mock initial values
  const initialValues = {
    name: 'George Floyd',
    email: 'gfloydicantbrt@aaa.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    department_id: 2,
    id: id || 'M067'
  };

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px', borderRadius: 8 }}>
      <Space align="center" style={{ marginBottom: 32 }}>
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ fontWeight: 600, paddingLeft: 0 }}
        >
          Back
        </Button>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Edit user info
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
        initialValues={initialValues}
      >
        <Form.Item
          label={<Text strong>Name</Text>}
          name="name"
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="Enter name" size="large" />
        </Form.Item>

        <Form.Item
          label={<Text strong>Email</Text>}
          name="email"
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="Enter email" size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Role</Text>}
              name="role"
              style={{ marginBottom: 16 }}
            >
              <Select 
                size="large"
                disabled={!isAdmin}
                options={[
                  { value: 'MEMBER', label: 'Member' },
                  { value: 'PM', label: 'Project manager' },
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
              label={<Text strong>Department ID</Text>}
              name="department_id"
              style={{ marginBottom: 16 }}
            >
              <Input size="large" type="number" disabled={!isAdmin} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Status</Text>}
              name="status"
              style={{ marginBottom: 16 }}
            >
              <Select 
                size="large"
                disabled={!isAdmin}
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'DISABLED', label: 'Disabled' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Button 
            type="primary" 
            htmlType="submit"
            style={{ 
              backgroundColor: '#d1d5db', 
              color: '#374151',
              fontWeight: 600,
              border: 'none',
              padding: '0 32px',
              height: 40,
              borderRadius: 6
            }}
          >
            Change
          </Button>
        </div>
      </Form>
    </div>
  );
}
