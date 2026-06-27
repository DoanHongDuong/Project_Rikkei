import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { ProjectOutlined, CheckCircleOutlined, WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import AuthService from '../../services/authService';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = AuthService.getUser();
    setUser(userData);
  }, []);

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginTop: 0 }}>Good morning, {user.full_name || 'Long'}!</Title>
        <Text type="secondary">Here is what's happening with your projects today.</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Total Projects" 
              value={12} 
              prefix={<ProjectOutlined style={{ color: '#2563EB' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Total Tasks" 
              value={245} 
              prefix={<CheckCircleOutlined style={{ color: '#8b5cf6' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Completed" 
              value={190} 
              valueStyle={{ color: '#22C55E' }}
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Late Tasks" 
              value={12} 
              valueStyle={{ color: '#EF4444' }}
              prefix={<WarningOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Biểu đồ tiến độ" 
            bordered={false} 
            style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: 300 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: '#9ca3af' }}>
              <ClockCircleOutlined style={{ fontSize: 24, marginRight: 8 }} />
              Chart Placeholder
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Recent Activity" 
            bordered={false} 
            style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: 300 }}
          >
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: '#9ca3af' }}>
              No recent activity
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
