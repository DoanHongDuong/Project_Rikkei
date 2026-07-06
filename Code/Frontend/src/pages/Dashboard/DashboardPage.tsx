import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, message, Skeleton, Statistic, Progress, Badge, Empty } from 'antd';
import { ProjectOutlined, CheckSquareOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/authService';
import DashboardService from '../../services/dashboardService';
import type { AuthUser } from '../../types/auth';

const { Title, Text } = Typography;

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = AuthService.getUser();
    setUser(userData);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getMemberDashboard();
      if (response.success && response.data) {
        setMetrics(response.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || loading) {
    return <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 10 }} /></div>;
  }

  const { totalProjects, totalTasks, completedTasks, overdueTasks, taskStatusDistribution, taskPriorityDistribution, activeProjects } = metrics || {};

  return (
    <div style={{ backgroundColor: '#F9FAFB', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginTop: 0, fontWeight: 700 }}>{t('page.dashboard.title')}, {user.full_name}!</Title>
        <Text type="secondary">Đây là tổng quan tiến độ và công việc của bạn.</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Dự án tham gia</span>}
              value={totalProjects || 0} 
              prefix={<ProjectOutlined style={{ color: '#8b5cf6' }} />} 
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Công việc được giao</span>}
              value={totalTasks || 0} 
              prefix={<CheckSquareOutlined style={{ color: '#3B82F6' }} />} 
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Đã hoàn thành</span>}
              value={completedTasks || 0} 
              prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />} 
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Đang trễ hạn</span>}
              value={overdueTasks || 0} 
              prefix={<WarningOutlined style={{ color: '#EF4444' }} />} 
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Trạng thái Công việc" 
            bordered={false} 
            style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: 400 }}
          >
            {taskStatusDistribution && taskStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskStatusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {taskStatusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#9ca3af' }}>Không có dữ liệu công việc</div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Công việc theo Mức độ Ưu tiên" 
            bordered={false} 
            style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: 400 }}
          >
             {taskPriorityDistribution && taskPriorityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={taskPriorityDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#F59E0B" name="Số lượng" radius={[4, 4, 0, 0]}>
                    {taskPriorityDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#9ca3af' }}>Không có dữ liệu công việc</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title="Dự án đang tham gia" 
            bordered={false} 
            style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            {!activeProjects || activeProjects.length === 0 ? (
              <Empty description="Bạn chưa tham gia dự án nào" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeProjects.map((project: any) => (
                  <div key={project.id} style={{ 
                    padding: '16px', 
                    backgroundColor: '#F3F4F6', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Title level={5} style={{ margin: 0, color: '#111827' }}>{project.name}</Title>
                        <Badge 
                          count={project.role} 
                          style={{ backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD', fontWeight: 600, boxShadow: 'none' }} 
                        />
                        <Badge 
                          count={project.status} 
                          style={{ backgroundColor: project.status === 'ACTIVE' ? '#D1FAE5' : '#F3F4F6', color: project.status === 'ACTIVE' ? '#059669' : '#4B5563', border: '1px solid #A7F3D0', fontWeight: 600, boxShadow: 'none' }} 
                        />
                      </div>
                    </div>
                    <div style={{ width: '30%', minWidth: '150px' }}>
                      <Text style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Tiến độ công việc (Tổng quan)</Text>
                      <Progress percent={project.progress} size="small" strokeColor={project.progress === 100 ? '#10B981' : '#3B82F6'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}