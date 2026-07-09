import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, message, Skeleton, Statistic, Table, Tag } from 'antd';
import { ProjectOutlined, DashboardOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import DashboardService from '../../services/dashboardService';

const { Title, Text } = Typography;

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function PMDashboardPage() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await DashboardService.getPmDashboard();
        if (response.success && response.data) {
          setMetrics(response.data);
        }
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi tải dữ liệu PM Dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !metrics) {
    return <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 10 }} /></div>;
  }

  const {
    totalProjects,
    activeProjects,
    completedProjects,
    atRiskProjects,
    projectStatusDistribution,
    topProjectsProgress,
    recentProjects
  } = metrics;

  const tableColumns = [
    {
      title: t('page.dashboard.table.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t('page.dashboard.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'ACTIVE') color = 'processing';
        else if (status === 'COMPLETED') color = 'success';
        else if (status === 'ON_HOLD') color = 'warning';
        return <Tag color={color}>{t(`page.dashboard.status.${status}`)}</Tag>;
      },
    },
    {
      title: t('page.dashboard.table.deadline'),
      dataIndex: 'end_date',
      key: 'end_date',
      render: (text: string) => text ? new Date(text).toLocaleDateString() : t('page.dashboard.table.no_deadline'),
    },
    {
      title: t('page.dashboard.table.warning'),
      dataIndex: 'isAtRisk',
      key: 'isAtRisk',
      render: (isAtRisk: boolean) => isAtRisk ? <Tag color="error">{t('page.dashboard.table.at_risk')}</Tag> : <Text type="secondary">{t('page.dashboard.table.normal')}</Text>,
    },
    {
      title: t('page.dashboard.table.progress'),
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    }
  ];

  return (
    <div style={{ backgroundColor: '#F9FAFB', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1E3A5F' }}>{t('page.dashboard.title')}</Title>
        <Text type="secondary">{t('page.dashboard.desc_pm')}</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>{t('page.dashboard.total_projects')}</span>}
              value={totalProjects || 0}
              prefix={<ProjectOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>{t('page.dashboard.active_projects')}</span>}
              value={activeProjects || 0}
              prefix={<DashboardOutlined style={{ color: '#3B82F6' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>{t('page.dashboard.completed_projects')}</span>}
              value={completedProjects || 0}
              prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>{t('page.dashboard.at_risk_projects')}</span>}
              value={atRiskProjects || 0}
              prefix={<WarningOutlined style={{ color: '#EF4444' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={10}>
          <Card
            title={t('page.dashboard.project_status')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: 400 }}
          >
            {(() => {
              let chartData = projectStatusDistribution || [];
              if (chartData.length > 0) {
                const activeIdx = chartData.findIndex((d: any) => d.status === 'ACTIVE');
                const completedIdx = chartData.findIndex((d: any) => d.status === 'COMPLETED');
                if (activeIdx !== -1 && completedIdx !== -1) {
                  chartData = [...chartData];
                  const temp = chartData[activeIdx];
                  chartData[activeIdx] = chartData[completedIdx];
                  chartData[completedIdx] = temp;
                }
              }

              return chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry: any, index: number) => {
                        let color = COLORS[index % COLORS.length];
                        if (entry.status === 'ACTIVE') color = '#3B82F6'; // Blue
                        else if (entry.status === 'COMPLETED') color = '#10B981'; // Green
                        else if (entry.status === 'ON_HOLD') color = '#F59E0B'; // Orange
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#9ca3af' }}>{t('page.dashboard.no_project_data')}</div>
              );
            })()}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            title={t('page.dashboard.top_progress')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: 400 }}
          >
            {topProjectsProgress && topProjectsProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topProjectsProgress}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3B82F6" name={t('page.dashboard.total_task')} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10B981" name={t('page.dashboard.completed_task')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#9ca3af' }}>{t('page.dashboard.no_task_data')}</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={t('page.dashboard.managed_projects')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <Table
              columns={tableColumns}
              dataSource={recentProjects}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
