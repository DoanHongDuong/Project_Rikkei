import { Typography, Avatar, Button, Space, Row, Col, Tag } from 'antd';
import {
  LeftOutlined,
  MailOutlined,
  UserOutlined,
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

export default function UserInfo() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data based on schema.sql
  const userData = {
    id: id || '1',
    full_name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    department_id: 2, // Mock department
    created_at: '2023-01-15T08:30:00Z',
    last_login_at: '2023-06-25T14:45:00Z',
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px', borderRadius: 8 }}>
      <Space align="center" style={{ marginBottom: 32 }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate('/users')}
          style={{ fontWeight: 600, paddingLeft: 0 }}
        >
          Back
        </Button>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          User info
        </Title>
      </Space>

      <Row gutter={[32, 32]}>
        <Col>
          <Avatar
            size={120}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#f0f0f0', color: '#8c8c8c' }}
          />
        </Col>
        <Col flex="auto">
          <Title level={4} style={{ marginTop: 0, marginBottom: 16, fontWeight: 700 }}>
            {userData.full_name}
          </Title>
          <Space direction="vertical" size="middle">
            <Space>
              <BankOutlined style={{ fontSize: 18 }} />
              <Text>Department: {userData.department_id || 'N/A'}</Text>
            </Space>
            <Space>
              <MailOutlined style={{ fontSize: 18 }} />
              <Text>{userData.email}</Text>
            </Space>
            <Space>
              <CalendarOutlined style={{ fontSize: 18 }} />
              <Text>Joined: {new Date(userData.created_at).toLocaleDateString()}</Text>
            </Space>
          </Space>
        </Col>
      </Row>

      <div style={{ marginTop: 32 }}>
        <Title level={5} style={{ fontWeight: 700, marginBottom: 8 }}>Account Status</Title>
        <Text>
          <Tag color={userData.status === 'ACTIVE' ? 'green' : 'red'}>
            {userData.status}
          </Tag>
        </Text>
      </div>

      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ fontWeight: 700, marginBottom: 8 }}>Role</Title>
        <Text>{userData.role}</Text>
      </div>

      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ fontWeight: 700, marginBottom: 8 }}>Last active</Title>
        <Space>
          <ClockCircleOutlined />
          <Text>{userData.last_login_at ? new Date(userData.last_login_at).toLocaleString() : 'Never'}</Text>
        </Space>
      </div>

      <div style={{ marginTop: 48, display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Button
          style={{
            backgroundColor: '#e5e7eb',
            color: '#374151',
            fontWeight: 600,
            border: 'none',
            padding: '0 32px',
            height: 40,
            borderRadius: 6
          }}
          onClick={() => navigate(`/users/${userData.id}/edit`)}
        >
          Edit info
        </Button>
        <Button
          style={{
            backgroundColor: '#e5e7eb',
            color: '#374151',
            fontWeight: 600,
            border: 'none',
            padding: '0 32px',
            height: 40,
            borderRadius: 6
          }}
        >
          {userData.status === 'ACTIVE' ? 'Disable user' : 'Enable user'}
        </Button>
      </div>
    </div>
  );
}
