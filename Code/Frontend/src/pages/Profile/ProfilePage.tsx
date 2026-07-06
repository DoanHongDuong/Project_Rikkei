import { useState, useEffect } from 'react';
import { Typography, Avatar, Card, Space, Row, Col, Tag, message, Spin, Button, Input, Tabs, Form } from 'antd';
import {
  MailOutlined,
  UserOutlined,
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserService from '../../services/userService';
import DepartmentService from '../../services/departmentService';
import AuthService from '../../services/authService';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordForm] = Form.useForm();

  const fetchProfileInfo = async () => {
    setLoading(true);
    try {
      const response = await UserService.getMyProfile();
      if (response.data) {
        setUserData(response.data);
        setFullNameInput(response.data.full_name);
        if (response.data.department_id) {
          try {
            const deptsResponse = await DepartmentService.getAll();
            const dept = deptsResponse.data?.find((d: any) => d.id === response.data.department_id);
            if (dept) {
              setDepartmentName(dept.name);
            }
          } catch (e) {
            console.error('Failed to fetch departments', e);
          }
        }
      }
    } catch (error: any) {
      message.error(error.message || t('page.profile.load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  const handleSave = async () => {
    if (!fullNameInput.trim()) {
      message.error(t('page.profile.full_name_required'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await UserService.updateMyProfile({ full_name: fullNameInput.trim() });
      if (response.success) {
        message.success(t('page.profile.update_success'));
        setUserData(response.data);
        
        const currentUser = AuthService.getUser();
        if (currentUser) {
          currentUser.full_name = response.data.full_name;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }

        setIsEditing(false);
        window.dispatchEvent(new Event('user-profile-updated'));
      }
    } catch (error: any) {
      message.error(error.message || t('page.profile.update_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFullNameInput(userData.full_name);
    }
    setIsEditing(false);
  };

  const handleChangePassword = async (values: any) => {
    const { currentPassword, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error(t('page.profile.password_mismatch'));
      return;
    }

    setPasswordSubmitting(true);
    try {
      const response = await UserService.changePassword({
        currentPassword,
        newPassword
      });

      if (response.success) {
        message.success(t('page.profile.change_password_success'));
        passwordForm.resetFields();
        
        setTimeout(() => {
          AuthService.logout();
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (error: any) {
      message.error(error.message || t('page.profile.change_password_error'));
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 50px' }}><Spin size="large" /></div>;
  }

  if (!userData) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '24px 32px', borderRadius: 8, textAlign: 'center', color: '#888' }}>
        {t('page.profile.not_found')}
      </div>
    );
  }

  // Cấu trúc nội dung của Tab thông tin
  const profileTabContent = (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Card type="inner" title={t('page.profile.basic_info')} style={{ height: '100%', borderRadius: 8 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Space style={{ marginBottom: 4 }}>
                  <UserOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{t('page.profile.full_name')}</Text>
                </Space>
                <div>
                  <Text strong>{userData.full_name}</Text>
                </div>
              </div>

              <div>
                <Space style={{ marginBottom: 4 }}>
                  <MailOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{t('page.profile.email')}</Text>
                </Space>
                <div><Text strong>{userData.email}</Text></div>
              </div>

              <div>
                <Space style={{ marginBottom: 4 }}>
                  <BankOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{t('page.profile.department')}</Text>
                </Space>
                <div><Text strong>{departmentName || t('page.profile.not_assigned')}</Text></div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card type="inner" title={t('page.profile.account_role')} style={{ height: '100%', borderRadius: 8 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Space style={{ marginBottom: 4 }}>
                  <SafetyCertificateOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{t('page.profile.role')}</Text>
                </Space>
                <div>
                  <Tag color="blue" style={{ fontSize: '13px', padding: '2px 10px', fontWeight: 600 }}>
                    {userData.role}
                  </Tag>
                </div>
              </div>

              <div>
                <Space style={{ marginBottom: 4 }}>
                  <SafetyCertificateOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{t('page.profile.status')}</Text>
                </Space>
                <div>
                  <Tag color={userData.status === 'ACTIVE' ? 'green' : 'red'} style={{ fontSize: '13px', padding: '2px 10px', fontWeight: 600 }}>
                    {userData.status}
                  </Tag>
                </div>
              </div>

              <div>
                <Space style={{ marginBottom: 4 }}>
                  <CalendarOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{t('page.profile.created_at')}</Text>
                </Space>
                <div><Text strong>{new Date(userData.created_at).toLocaleDateString('vi-VN')}</Text></div>
              </div>

              {userData.last_login_at && (
                <div>
                  <Space style={{ marginBottom: 4 }}>
                    <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">{t('page.profile.last_login')}</Text>
                  </Space>
                  <div><Text strong>{new Date(userData.last_login_at).toLocaleString('vi-VN')}</Text></div>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Cấu trúc nội dung của Tab Đổi mật khẩu
  const changePasswordTabContent = (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handleChangePassword}
        requiredMark={false}
      >
        <Form.Item
          label={t('page.profile.current_password')}
          name="currentPassword"
          rules={[{ required: true, message: t('page.profile.current_password_required') }]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder={t('page.profile.current_password')} style={{ borderRadius: 6, height: 40 }} />
        </Form.Item>

        <Form.Item
          label={t('page.profile.new_password')}
          name="newPassword"
          rules={[
            { required: true, message: t('page.profile.new_password_required') },
            { min: 6, message: t('page.profile.new_password_min') }
          ]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder={t('page.profile.new_password')} style={{ borderRadius: 6, height: 40 }} />
        </Form.Item>

        <Form.Item
          label={t('page.profile.confirm_password')}
          name="confirmPassword"
          rules={[{ required: true, message: t('page.profile.confirm_password_required') }]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder={t('page.profile.confirm_password')} style={{ borderRadius: 6, height: 40 }} />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, textAlign: 'center' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={passwordSubmitting}
            style={{ borderRadius: 6, height: 40, width: '100%', fontWeight: 600 }}
          >
            {t('page.profile.change_password_btn')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const tabItems = [
    {
      key: 'info',
      label: t('page.profile.tab_info'),
      children: profileTabContent,
    },
    {
      key: 'password',
      label: t('page.profile.tab_password'),
      children: changePasswordTabContent,
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Card
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Avatar
            size={120}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#2563EB', color: '#fff', marginBottom: 16 }}
          />
          {isEditing ? (
            <div style={{ maxWidth: '300px', margin: '0 auto 8px auto' }}>
              <Input
                size="large"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder="Nhập họ và tên"
                style={{ textAlign: 'center', borderRadius: 6 }}
              />
            </div>
          ) : (
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              {userData.full_name}
            </Title>
          )}
          <div>
            <Text type="secondary">{userData.email}</Text>
          </div>

          <div style={{ marginTop: 16 }}>
            {isEditing ? (
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={submitting}
                  style={{ borderRadius: 6 }}
                >
                  {t('page.profile.save_changes')}
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                  disabled={submitting}
                  style={{ borderRadius: 6 }}
                >
                  {t('page.profile.cancel')}
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                style={{ borderRadius: 6 }}
              >
                {t('page.profile.edit_profile')}
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultActiveKey="info" items={tabItems} style={{ marginTop: 24 }} />
      </Card>
    </div>
  );
}
