import { useState, useEffect } from 'react';
import { Typography, Avatar, Button, Space, Row, Col, Tag, message, Spin } from 'antd';
import {
  LeftOutlined,
  MailOutlined,
  UserOutlined,
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../../services/userService';

const { Title, Text } = Typography;

export default function UserInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await UserService.getUserById(id);
      if (response.data) {
        setUserData(response.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!userData) return;
    const newStatus = userData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await UserService.updateUserStatus(userData.id, newStatus);
      message.success(`Đã đổi trạng thái thành ${newStatus}`);
      fetchUserInfo(); // Tải lại thông tin mới nhất
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!userData) {
    return (
      <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px' }}>
        <Space align="center" style={{ marginBottom: 32 }}>
          <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/users')} style={{ fontWeight: 600 }}>Back</Button>
        </Space>
        <div style={{ textAlign: 'center', color: '#888' }}>Không tìm thấy thông tin người dùng.</div>
      </div>
    );
  }

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
          Thông tin chi tiết
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
              <Text>Phòng ban: ID {userData.department_id || 'Chưa phân bổ'}</Text>
            </Space>
            <Space>
              <MailOutlined style={{ fontSize: 18 }} />
              <Text>{userData.email}</Text>
            </Space>
            <Space>
              <CalendarOutlined style={{ fontSize: 18 }} />
              <Text>Tham gia: {new Date(userData.created_at).toLocaleDateString('vi-VN')}</Text>
            </Space>
          </Space>
        </Col>
      </Row>

      <div style={{ marginTop: 32 }}>
        <Title level={5} style={{ fontWeight: 700, marginBottom: 8 }}>Trạng thái tài khoản</Title>
        <Text>
          <Tag color={userData.status === 'ACTIVE' ? 'green' : 'red'}>
            {userData.status}
          </Tag>
        </Text>
      </div>

      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ fontWeight: 700, marginBottom: 8 }}>Vai trò</Title>
        <Text>{userData.role}</Text>
      </div>

      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ fontWeight: 700, marginBottom: 8 }}>Đăng nhập gần nhất</Title>
        <Space>
          <ClockCircleOutlined />
          <Text>{userData.last_login_at ? new Date(userData.last_login_at).toLocaleString('vi-VN') : 'Chưa từng đăng nhập'}</Text>
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
          Sửa thông tin
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
          onClick={handleToggleStatus}
        >
          {userData.status === 'ACTIVE' ? 'Vô hiệu hóa (Disable)' : 'Kích hoạt (Enable)'}
        </Button>
      </div>
    </div>
  );
}
