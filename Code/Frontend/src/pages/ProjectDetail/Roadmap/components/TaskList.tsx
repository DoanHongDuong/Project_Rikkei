import { List, Checkbox, Avatar, Tag, Space, Typography, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Task } from '../types/roadmap';

const { Text } = Typography;

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Planning': return '#F59E0B';
      case 'Delayed': return '#EF4444';
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
                <Checkbox checked={task.status === 'Completed'} />
                <Text delete={task.status === 'Completed'} style={{ fontWeight: 500, color: task.status === 'Completed' ? '#9CA3AF' : '#374151' }}>
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
