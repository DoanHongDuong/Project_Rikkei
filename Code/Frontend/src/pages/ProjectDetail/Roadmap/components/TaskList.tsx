import { List, Checkbox, Avatar, Tag, Space, Typography, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Task } from '../types/roadmap';

const { Text } = Typography;

export default function TaskList({ tasks, onTaskStatusChange }: { tasks: Task[], onTaskStatusChange?: (taskId: string | number, newStatus: string) => void }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
      case 'HIGH':
      case 'URGENT': return 'red';
      case 'Medium':
      case 'MEDIUM': return 'orange';
      case 'Low':
      case 'LOW': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'DONE': return '#10B981';
      case 'IN_PROGRESS': return '#3B82F6';
      case 'TODO': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <List
        size="small"
        rowKey="id"
        dataSource={tasks}
        renderItem={task => (
          <List.Item
            style={{
              padding: '12px 16px',
              border: '1px solid #F3F4F6',
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor: '#FAFAFA'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 8 }}>
              <Space size="middle">
                <Checkbox 
                  checked={task.status === 'DONE'} 
                  onChange={(e) => onTaskStatusChange?.(task.id, e.target.checked ? 'DONE' : 'TODO')}
                />
                <Text delete={task.status === 'DONE'} style={{ fontWeight: 500, color: task.status === 'DONE' ? '#9CA3AF' : '#374151' }}>
                  {task.title}
                </Text>
              </Space>

              <Space size="middle" style={{ flexWrap: 'wrap' }}>
                <Tag color={getPriorityColor(task.priority)} style={{ borderRadius: 4, margin: 0 }}>
                  {task.priority}
                </Tag>

                <span style={{ fontSize: 12, fontWeight: 600, color: getStatusColor(task.status) }}>
                  {task.status}
                </span>

                <Text type="secondary" style={{ fontSize: 12, minWidth: 80, textAlign: 'right' }}>
                  {task.dueDate}
                </Text>

                <Tooltip title={task.assignee}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#E0E7FF', color: '#4F46E5' }} />
                </Tooltip>
              </Space>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
