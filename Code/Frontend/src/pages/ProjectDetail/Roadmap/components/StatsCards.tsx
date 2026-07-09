import { Row, Col, Card, Statistic } from 'antd';
import { ProjectOutlined, CheckCircleOutlined, SyncOutlined, ClockCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { Milestone } from '../types/roadmap';

export default function StatsCards({ milestones }: { milestones: Milestone[] }) {
  const total = milestones.length;
  const completed = milestones.filter(m => m.status === 'DONE').length;
  const inProgress = milestones.filter(m => m.status === 'IN_PROGRESS').length;
  const todo = milestones.filter(m => m.status === 'TODO').length;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Statistic
            title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Total Milestones</span>}
            value={total}
            prefix={<ProjectOutlined style={{ color: '#8B5CF6' }} />}
            valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Statistic
            title={<span style={{ fontWeight: 500, color: '#6B7280' }}>Completed</span>}
            value={completed}
            prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
            valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Statistic
            title={<span style={{ fontWeight: 500, color: '#6B7280' }}>In Progress</span>}
            value={inProgress}
            prefix={<SyncOutlined style={{ color: '#3B82F6' }} />}
            valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Statistic
            title={<span style={{ fontWeight: 500, color: '#6B7280' }}>TODO</span>}
            value={todo}
            prefix={<ClockCircleOutlined style={{ color: '#F59E0B' }} />}
            valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
