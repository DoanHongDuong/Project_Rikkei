import { Typography, Input, Select, Button, Form, Row, Col, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function CreateUser() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px' }}>
      <Title level={2} style={{ marginTop: 0, marginBottom: 24, fontWeight: 700 }}>
        Create an user
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label={<Text strong>Name</Text>}
          name="name"
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="Enter the full name" size="large" />
        </Form.Item>

        <Form.Item
          label={<Text strong>Email</Text>}
          name="email"
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="Enter the personal or organizer email address" size="large" />
        </Form.Item>

        <Form.Item
          label={<Text strong>Password</Text>}
          name="password"
          style={{ marginBottom: 16 }}
        >
          <Input.Password placeholder="At least 8 characters, include numbers" size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Role</Text>}
              name="role"
              style={{ marginBottom: 16 }}
            >
              <Select 
                placeholder="Member" 
                size="large"
                options={[
                  { value: 'member', label: 'Member' },
                  { value: 'pm', label: 'Project manager' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Phòng ban/Department</Text>}
              name="department"
              style={{ marginBottom: 16 }}
            >
              <Input placeholder="Developer" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
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
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
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
              Create
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
