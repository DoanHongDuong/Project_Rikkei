import { Card, Typography, Progress, Badge, Avatar, Space, Collapse, Tooltip } from 'antd';
import { UserOutlined, ClockCircleOutlined, TeamOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { Milestone } from '../types/roadmap';
import TaskList from './TaskList';

const { Text, Title, Paragraph } = Typography;

export default function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10B981'; // Green
      case 'In Progress': return '#3B82F6'; // Blue
      case 'Planning': return '#F59E0B'; // Orange
      case 'Delayed': return '#EF4444'; // Red
      default: return '#6B7280';
    }
  };

  const statusColor = getStatusColor(milestone.status);

  return (
    <Card 
      bordered={false} 
      style={{ 
        borderRadius: 12, 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        marginBottom: 24,
        overflow: 'hidden',
        borderLeft: `4px solid ${statusColor}`
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Title level={4} style={{ margin: 0, color: '#111827' }}>{milestone.title}</Title>
              <Badge 
                count={milestone.status} 
                style={{ 
                  backgroundColor: `${statusColor}15`, 
                  color: statusColor, 
                  fontWeight: 600, 
                  boxShadow: 'none',
                  borderRadius: 4,
                  padding: '0 8px'
                }} 
              />
            </div>
            
            <Paragraph type="secondary" style={{ marginBottom: 16, fontSize: 14 }}>
              {milestone.description}
            </Paragraph>

            <Space size="large" style={{ flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563' }}>
                <ClockCircleOutlined />
                <Text type="secondary" style={{ fontSize: 13 }}>{milestone.startDate} - {milestone.dueDate}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563' }}>
                <TeamOutlined />
                <Text type="secondary" style={{ fontSize: 13 }}>{milestone.owner}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563' }}>
                <UnorderedListOutlined />
                <Text type="secondary" style={{ fontSize: 13 }}>{milestone.tasks.length} tasks</Text>
              </div>
            </Space>
          </div>

          <div style={{ width: 150, textAlign: 'right' }}>
            <Text style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Progress</Text>
            <Progress 
              percent={milestone.progress} 
              strokeColor={statusColor} 
              trailColor="#F3F4F6"
              strokeWidth={8}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Avatar.Group size="small" maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                {milestone.tasks.map(t => t.assignee).filter((v, i, a) => a.indexOf(v) === i).map((assignee, idx) => (
                  <Tooltip key={idx} title={assignee}>
                    <Avatar icon={<UserOutlined />} />
                  </Tooltip>
                ))}
              </Avatar.Group>
            </div>
          </div>
        </div>
      </div>

      {milestone.tasks.length > 0 && (
        <Collapse ghost style={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
          <Collapse.Panel 
            header={<span style={{ fontWeight: 500, color: '#4B5563' }}>View Tasks ({milestone.tasks.length})</span>} 
            key="1"
          >
            <TaskList tasks={milestone.tasks} />
          </Collapse.Panel>
        </Collapse>
      )}
    </Card>
  );
}
