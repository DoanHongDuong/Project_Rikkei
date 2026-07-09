import { Card, Typography, Progress, Badge, Space, Collapse, Button, Popconfirm } from 'antd';
import { ClockCircleOutlined, TeamOutlined, UnorderedListOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Milestone } from '../types/roadmap';
import TaskList from './TaskList';

const { Text, Title, Paragraph } = Typography;

export default function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
  onTaskStatusChange
}: {
  milestone: Milestone;
  onEdit?: (m: Milestone) => void;
  onDelete?: (id: number) => void;
  onAddTask?: (m: Milestone) => void;
  onTaskStatusChange?: (taskId: string | number, newStatus: string) => void;
}) {
  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'DONE': return '#10B981';
      case 'IN_PROGRESS': return '#3B82F6';
      case 'TODO': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const statusColor = getStatusColor(milestone.status);
  const tasks = milestone.tasks || [];
  // Ưu tiên progress thật từ API (tính theo tỉ lệ task DONE / tổng task của milestone).
  // Dùng typeof thay vì `||` vì progress thật có thể = 0 (falsy) nhưng vẫn hợp lệ.
  const progress = typeof milestone.progress === 'number'
    ? milestone.progress
    : (milestone.status === 'DONE' ? 100 : milestone.status === 'IN_PROGRESS' ? 50 : 0);

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

            {milestone.description && (
              <Paragraph type="secondary" style={{ marginBottom: 16, fontSize: 14 }}>
                {milestone.description}
              </Paragraph>
            )}

            <Space size="large" style={{ flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563' }}>
                <ClockCircleOutlined />
                <Text type="secondary" style={{ fontSize: 13 }}>{milestone.start_date} - {milestone.end_date}</Text>
              </div>
              {milestone.owner && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563' }}>
                  <TeamOutlined />
                  <Text type="secondary" style={{ fontSize: 13 }}>{milestone.owner}</Text>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563' }}>
                <UnorderedListOutlined />
                <Text type="secondary" style={{ fontSize: 13 }}>{tasks.length} tasks</Text>
              </div>
            </Space>
          </div>

          <div style={{ width: 150, textAlign: 'right' }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 12 }}>
              {onEdit && (
                <Button size="small" type="text" icon={<EditOutlined />} onClick={() => onEdit(milestone)} />
              )}
              {onDelete && (
                <Popconfirm title="Xóa mốc thời gian này?" onConfirm={() => onDelete(milestone.id)}>
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              )}
            </div>

            <Text style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Progress</Text>
            <Progress
              percent={progress}
              strokeColor={statusColor}
              trailColor="#F3F4F6"
              strokeWidth={8}
            />

          </div>
        </div>
      </div>

      {tasks.length > 0 && (
        <Collapse ghost style={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
          <Collapse.Panel
            header={<span style={{ fontWeight: 500, color: '#4B5563' }}>View Tasks ({tasks.length})</span>}
            key="1"
          >
            <TaskList tasks={tasks} onTaskStatusChange={onTaskStatusChange} />
          </Collapse.Panel>
        </Collapse>
      )}
    </Card>
  );
}
