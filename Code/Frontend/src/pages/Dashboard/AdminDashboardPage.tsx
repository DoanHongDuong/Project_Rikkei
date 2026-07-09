import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, message, Skeleton } from 'antd';
import { UserOutlined, ProjectOutlined, CheckCircleOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/authService';
import DashboardService from '../../services/dashboardService';

const { Title, Text } = Typography;

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = AuthService.getUser();
    setUser(userData);

    const fetchDashboardData = async () => {
      try {
        const response = await DashboardService.getAdminDashboard();
        if (response.success && response.data) {
          setMetrics(response.data);
        }
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi lấy dữ liệu Dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!user || loading) {
    return <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 10 }} /></div>;

  }

  const { totalUsers, totalProjects, totalTasks, activeProjects, projectStatusDistribution, taskStatusDistribution } = metrics;

  return (
    <div style={{ backgroundColor: '#F9FAFB', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginTop: 0, fontWeight: 700 }}>{t('page.dashboard.title')}</Title>
        <Text type="secondary">{t('page.dashboard.desc_admin')}</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>{t('page.dashboard.total_users')}</span>}
              value={totalUsers}
              prefix={<UserOutlined style={{ color: '#2563EB' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>{t('page.dashboard.total_projects')}</span>}
              value={totalProjects}
              prefix={<ProjectOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>{t('page.dashboard.total_tasks_admin')}</span>}
              value={totalTasks}
              prefix={<CheckSquareOutlined style={{ color: '#F59E0B' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>{t('page.dashboard.active_projects')}</span>}
              value={activeProjects}
              prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24] as const} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={t('page.dashboard.project_status')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: 400 }}
          >
            {projectStatusDistribution && projectStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {projectStatusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#9ca3af' }}>{t('page.dashboard.no_project_data')}</div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={t('page.dashboard.task_status')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: 400 }}
          >
            {taskStatusDistribution && taskStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={taskStatusDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name={t('page.dashboard.tasks')} radius={[4, 4, 0, 0]}>
                    {taskStatusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#9ca3af' }}>{t('page.dashboard.no_task_data')}</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
