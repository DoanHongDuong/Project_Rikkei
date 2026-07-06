import { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Typography, Tag, Table, Select,
  Progress, message, Skeleton, Empty, Timeline,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import ReportService, {
  type AdminReportData,
  type ProjectReportItem,
  type UserPerformanceItem,
  type DepartmentSummaryItem,
  type ActivityTimelineItem,
} from '../../services/reportService';

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Color Palettes ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  REVIEW: '#8b5cf6',
  BLOCKED: '#ef4444',
  DONE: '#10b981',
  CANCELED: '#6b7280',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#22d3ee',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  URGENT: '#ef4444',
};

const PROJECT_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'green',
  COMPLETED: 'blue',
  ON_HOLD: 'orange',
  ARCHIVED: 'default',
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function KpiCard({ title, value, suffix, icon, color, bgColor }: KpiCardProps) {
  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Statistic
          title={<span style={{ fontWeight: 500, color: '#6B7280', fontSize: 13 }}>{title}</span>}
          value={value}
          suffix={suffix}
          valueStyle={{ fontWeight: 700, fontSize: 28, color: '#111827' }}
        />
        <div
          style={{
            width: 48, height: 48, borderRadius: 12, backgroundColor: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Chart Empty State ────────────────────────────────────────────────────────

function ChartEmpty({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280, color: '#9ca3af' }}>
      <Empty description={label} image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<AdminReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await ReportService.getAdminReport();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('page.reports.error');
        message.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [t]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 16 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description={t('page.reports.error')} />
      </div>
    );
  }

  const { taskOverview, taskByStatus, taskByPriority, taskByProject,
    projectReport, userPerformance, departmentSummary, activityTimeline,
    projectStatusDistribution, taskTrend } = data;

  // ── Filtered project list ──────────────────────────────────────────────────
  const filteredProjects = projectStatusFilter === 'ALL'
    ? projectReport
    : projectReport.filter(p => p.status === projectStatusFilter);

  // ── Bar chart data: status label with colour ───────────────────────────────
  const taskStatusChartData = taskByStatus.map(item => ({
    ...item,
    fill: STATUS_COLORS[item.status] ?? '#3b82f6',
  }));

  const taskPriorityChartData = taskByPriority.map(item => ({
    ...item,
    fill: PRIORITY_COLORS[item.priority] ?? '#f59e0b',
  }));

  const projectStatusChartData = (projectStatusDistribution || []).map(item => ({
    ...item,
    fill: PROJECT_STATUS_COLOR[item.status] ?? '#d1d5db',
  }));

  // ── Project Table columns ──────────────────────────────────────────────────
  const projectColumns: ColumnsType<ProjectReportItem> = [
    {
      title: t('page.reports.project_table.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('page.reports.project_table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <Tag color={PROJECT_STATUS_COLOR[status] ?? 'default'}>{status}</Tag>
      ),
    },
    {
      title: t('page.reports.project_table.manager'),
      dataIndex: 'managerName',
      key: 'managerName',
      width: 160,
      render: (name: string | null) => name ?? t('page.reports.project_table.no_deadline'),
    },
    {
      title: t('page.reports.project_table.total_tasks'),
      dataIndex: 'totalTasks',
      key: 'totalTasks',
      width: 110,
      align: 'center',
      sorter: (a, b) => a.totalTasks - b.totalTasks,
    },
    {
      title: t('page.reports.project_table.done_tasks'),
      dataIndex: 'doneTasks',
      key: 'doneTasks',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.doneTasks - b.doneTasks,
    },
    {
      title: t('page.reports.project_table.progress'),
      dataIndex: 'progress',
      key: 'progress',
      width: 160,
      sorter: (a, b) => a.progress - b.progress,
      render: (pct: number) => (
        <Progress
          percent={pct}
          size="small"
          strokeColor={pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'}
          format={v => `${v}%`}
        />
      ),
    },
    {
      title: t('page.reports.project_table.deadline'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (d: string | null) => d ?? t('page.reports.project_table.no_deadline'),
    },
  ];

  // ── User Performance Table columns ─────────────────────────────────────────
  const userColumns: ColumnsType<UserPerformanceItem> = [
    {
      title: t('page.reports.user_table.name'),
      dataIndex: 'fullName',
      key: 'fullName',
      ellipsis: true,
    },
    {
      title: t('page.reports.user_table.department'),
      dataIndex: 'department',
      key: 'department',
      width: 160,
      render: (d: string | null) => d ?? t('page.reports.user_table.no_department'),
    },
    {
      title: t('page.reports.user_table.assigned'),
      dataIndex: 'totalAssigned',
      key: 'totalAssigned',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.totalAssigned - b.totalAssigned,
    },
    {
      title: t('page.reports.user_table.done'),
      dataIndex: 'done',
      key: 'done',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.done - b.done,
      render: (v: number) => <span style={{ color: '#10b981', fontWeight: 600 }}>{v}</span>,
    },
    {
      title: t('page.reports.user_table.overdue'),
      dataIndex: 'overdue',
      key: 'overdue',
      width: 90,
      align: 'center',
      sorter: (a, b) => a.overdue - b.overdue,
      render: (v: number) => (
        <span style={{ color: v > 0 ? '#ef4444' : '#6b7280', fontWeight: v > 0 ? 600 : 400 }}>{v}</span>
      ),
    },
    {
      title: t('page.reports.user_table.rate'),
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 160,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.completionRate - b.completionRate,
      render: (pct: number) => (
        <Progress
          percent={pct}
          size="small"
          strokeColor={pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'}
          format={v => `${v}%`}
        />
      ),
    },
  ];

  // ── Department Card renderer ───────────────────────────────────────────────
  const renderDeptCard = (dept: DepartmentSummaryItem) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={dept.id}>
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: '100%' }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text strong style={{ fontSize: 15 }}>{dept.name}</Text>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {t('page.reports.department.users', { count: dept.userCount })}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {t('page.reports.department.active_tasks', { count: dept.activeTasks })}
          </Text>
        </div>
        <Progress
          percent={dept.completionRate}
          size="small"
          strokeColor={dept.completionRate >= 70 ? '#10b981' : dept.completionRate >= 40 ? '#f59e0b' : '#ef4444'}
          format={v => `${v}%`}
        />
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          {t('page.reports.department.completion_rate', { rate: dept.completionRate })}
        </Text>
      </Card>
    </Col>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: '#F9FAFB', padding: 24, borderRadius: 8 }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginTop: 0, fontWeight: 700 }}>
          {t('page.reports.title')}
        </Title>
        <Text type="secondary">{t('page.reports.subtitle')}</Text>
      </div>

      {/* ── Section 1: KPI Cards ── */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title={t('page.reports.kpi.total_tasks')}
            value={taskOverview.totalTasks}
            icon={<CheckCircleOutlined />}
            color="#3b82f6"
            bgColor="#eff6ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title={t('page.reports.kpi.done_tasks')}
            value={taskOverview.doneTasks}
            icon={<CheckCircleOutlined />}
            color="#10b981"
            bgColor="#ecfdf5"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title={t('page.reports.kpi.overdue_tasks')}
            value={taskOverview.overdueTasks}
            icon={<ExclamationCircleOutlined />}
            color="#ef4444"
            bgColor="#fef2f2"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title={t('page.reports.kpi.completion_rate')}
            value={taskOverview.completionRate}
            suffix="%"
            icon={<RiseOutlined />}
            color="#8b5cf6"
            bgColor="#f5f3ff"
          />
        </Col>
      </Row>

      {/* ── Section 2: Task Charts ── */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Bar chart: by status */}
        <Col xs={24} lg={12}>
          <Card
            title={t('page.reports.chart.task_by_status')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minHeight: 360 }}
          >
            {taskStatusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={taskStatusChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" name={t('page.reports.chart.count')} radius={[4, 4, 0, 0]}>
                    {taskStatusChartData.map((entry, i) => (
                      <Cell key={`status-${i}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty label={t('page.reports.chart.no_data')} />
            )}
          </Card>
        </Col>

        {/* Pie chart: by priority */}
        <Col xs={24} lg={12}>
          <Card
            title={t('page.reports.chart.task_by_priority')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minHeight: 360 }}
          >
            {taskPriorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={taskPriorityChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="priority"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {taskPriorityChartData.map((entry, i) => (
                      <Cell key={`prio-${i}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty label={t('page.reports.chart.no_data')} />
            )}
          </Card>
        </Col>

        {/* Bar chart: by project top 10 */}
        <Col xs={24}>
          <Card
            title={t('page.reports.chart.task_by_project')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minHeight: 360 }}
          >
            {taskByProject.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={taskByProject}
                  margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="projectName"
                    tick={{ fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="done" name="Done" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty label={t('page.reports.chart.no_data')} />
            )}
          </Card>
        </Col>

        {/* Donut Chart: Project Status Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title={t('page.reports.chart.project_status_distribution')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minHeight: 360 }}
          >
            {projectStatusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={projectStatusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {projectStatusChartData.map((entry, i) => (
                      <Cell key={`proj-status-${i}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty label={t('page.reports.chart.no_data')} />
            )}
          </Card>
        </Col>

        {/* Line Chart: Task Trend Last 7 Days */}
        <Col xs={24} lg={12}>
          <Card
            title={t('page.reports.chart.task_trend')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minHeight: 360 }}
          >
            {taskTrend && taskTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={taskTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <RechartsTooltip labelFormatter={(val) => new Date(val).toLocaleDateString()} />
                  <Legend />
                  <Line type="monotone" dataKey="created" name={t('page.reports.chart.task_trend_created')} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="completed" name={t('page.reports.chart.task_trend_completed')} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty label={t('page.reports.chart.no_data')} />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Section 3: Project Report Table ── */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{t('page.reports.project_table.title')}</span>
            <Select
              value={projectStatusFilter}
              onChange={setProjectStatusFilter}
              style={{ width: 160, fontWeight: 400 }}
              size="small"
            >
              <Option value="ALL">{t('page.reports.project_table.filter_all')}</Option>
              <Option value="ACTIVE">{t('page.reports.project_table.filter_active')}</Option>
              <Option value="COMPLETED">{t('page.reports.project_table.filter_completed')}</Option>
              <Option value="ON_HOLD">{t('page.reports.project_table.filter_on_hold')}</Option>
            </Select>
          </div>
        }
        bordered={false}
        style={{ marginTop: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        <Table<ProjectReportItem>
          columns={projectColumns}
          dataSource={filteredProjects}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* ── Section 4: User Performance Table ── */}
      <Card
        title={t('page.reports.user_table.title')}
        bordered={false}
        style={{ marginTop: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        <Table<UserPerformanceItem>
          columns={userColumns}
          dataSource={userPerformance}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* ── Section 5: Department Summary ── */}
      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          {t('page.reports.department.title')}
        </Title>
        {departmentSummary.length > 0 ? (
          <Row gutter={[16, 16]}>
            {departmentSummary.map(renderDeptCard)}
          </Row>
        ) : (
          <Empty description={t('page.reports.chart.no_data')} />
        )}
      </div>

      {/* ── Section 6: Activity Timeline ── */}
      <Card
        title={t('page.reports.timeline.title')}
        bordered={false}
        style={{ marginTop: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        {activityTimeline && activityTimeline.length > 0 ? (
          <Timeline>
            {activityTimeline.map((item) => {
              let text = '';
              const userName = item.updatedBy?.full_name || 'System';
              const userRole = item.updatedBy?.role || '';
              const user = userRole ? `${userName} (${userRole})` : userName;
              
              const taskName = item.task?.title || 'Unknown Task';
              const projectName = item.task?.project?.name || 'Unknown Project';

              if (item.action_type === 'TASK_CREATED') {
                text = t('page.reports.timeline.action_create', { user, task: taskName, project: projectName });
              } else if (item.action_type === 'TASK_DELETED') {
                text = t('page.reports.timeline.action_delete', { user, task: taskName, project: projectName });
              } else if (item.action_type === 'STATUS_CHANGED') {
                text = t('page.reports.timeline.action_update_status', { user, value: item.new_value, task: taskName, project: projectName });
              } else if (item.action_type === 'ASSIGNEE_CHANGED') {
                text = t('page.reports.timeline.action_update', { user, field: 'assignee', value: item.new_value || 'unassigned', task: taskName, project: projectName });
              } else if (item.action_type === 'TASK_UPDATED') {
                text = t('page.reports.timeline.action_update_info', { user, task: taskName, project: projectName });
              } else if (item.action_type === 'COMMENT_ADDED') {
                text = t('page.reports.timeline.action_comment_add', { user, task: taskName, project: projectName });
              } else if (item.action_type === 'COMMENT_DELETED') {
                text = t('page.reports.timeline.action_comment_delete', { user, task: taskName, project: projectName });
              } else {
                text = t('page.reports.timeline.action_unknown', { user, task: taskName, project: projectName });
              }

              const isDelete = item.action_type.includes('DELETE');
              const isCreate = item.action_type.includes('CREATE');
              
              return (
                <Timeline.Item key={item.id} color={isDelete ? 'red' : isCreate ? 'green' : 'blue'}>
                  <div style={{ marginBottom: 4 }}>
                    <Text>{text}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </Timeline.Item>
              );
            })}
          </Timeline>
        ) : (
          <Empty description={t('page.reports.timeline.no_data')} />
        )}
      </Card>

    </div>
  );
}
