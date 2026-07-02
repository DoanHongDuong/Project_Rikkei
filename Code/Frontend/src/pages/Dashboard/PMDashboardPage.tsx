import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, message, Skeleton, Statistic, Table, Tag } from 'antd';
import { ProjectOutlined, DashboardOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardService from '../../services/dashboardService';

const { Title, Text } = Typography;

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function PMDashboardPage() {
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
      title: 'Tên dự án',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'ACTIVE') color = 'processing';
        else if (status === 'COMPLETED') color = 'success';
        else if (status === 'ON_HOLD') color = 'warning';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Deadline',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (text: string) => text ? new Date(text).toLocaleDateString() : 'Không có',
    },
    {
      title: 'Cảnh báo',
      dataIndex: 'isAtRisk',
      key: 'isAtRisk',
      render: (isAtRisk: boolean) => isAtRisk ? <Tag color="error">Rủi ro / Trễ hạn</Tag> : <Text type="secondary">Bình thường</Text>,
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    }
  ];

  return (
    <div style={{ backgroundColor: '#F9FAFB', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginTop: 0, fontWeight: 700 }}>Tổng quan Quản lý Dự án</Title>
        <Text type="secondary">Hiển thị số liệu thống kê các dự án mà bạn đang quản lý.</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Tổng số Dự án</span>}
              value={totalProjects || 0}
              prefix={<ProjectOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Đang chạy (Active)</span>}
              value={activeProjects || 0}
              prefix={<DashboardOutlined style={{ color: '#3B82F6' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Đã hoàn thành</span>}
              value={completedProjects || 0}
              prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
              valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Rủi ro / Trễ hạn</span>}
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
            title="Trạng thái Dự án"
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#9ca3af' }}>Không có dữ liệu dự án</div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            title="Tiến độ Công việc theo Dự án (Top 5)"
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
                  <Bar dataKey="total" fill="#3B82F6" name="Tổng Task" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10B981" name="Task hoàn thành" radius={[4, 4, 0, 0]} />
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
            title="Danh sách Dự án Quản lý"
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
