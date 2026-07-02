import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Typography, Tabs, message, Spin, Empty, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import TaskService from '../../services/taskService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // No project_id passed -> fetch all tasks assigned to current user
      const data = await TaskService.getTasks();
      setTasks(data || []);
    } catch (error: any) {
      message.error(error.message || 'Lỗi tải công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'default';
    }
  };

  const TaskCard = ({ task }: { task: any }) => (
    <Card 
      bordered={false} 
      hoverable
      onClick={() => {
        const pId = task.project_id || task.project?.id;
        if (pId) {
          navigate(`/projects/${pId}?tab=2&highlightTask=${task.id}`);
        }
      }}
      style={{ 
        backgroundColor: '#F3F4F6', 
        borderRadius: '8px',
        marginBottom: '16px',
        opacity: task.status === 'DONE' ? 0.7 : 1
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '16px', textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>
            {task.title}
          </Title>
          <Paragraph 
            style={{ 
              color: '#4B5563', 
              fontSize: '12px', 
              marginBottom: '12px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {task.description || 'Không có mô tả'}
          </Paragraph>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {task.deadline && (
              <Text style={{ fontWeight: 500, fontSize: '13px', color: dayjs(task.deadline).isBefore(dayjs().startOf('day')) && task.status !== 'DONE' ? 'red' : 'inherit' }}>
                Hạn chót: {dayjs(task.deadline).format('DD/MM/YYYY')}
              </Text>
            )}
            <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
            <Tag color={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'processing' : 'default'}>
              {task.status}
            </Tag>
          </div>
        </div>
      </div>
    </Card>
  );

  const ProjectGroup = ({ title, groupTasks }: { title: string, groupTasks: any[] }) => {
    if (!groupTasks || groupTasks.length === 0) return null;
    return (
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ margin: '0 0 16px 0', fontSize: '18px' }}>{title}</Title>
        <Row gutter={[16, 16]}>
          {groupTasks.map(task => (
            <Col xs={24} sm={12} key={task.id}>
              <TaskCard task={task} />
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const groupedTasks = useMemo(() => {
    const today = dayjs().startOf('day');
    const endOfWeek = dayjs().endOf('week');

    const result = {
      today: {} as Record<string, any[]>,
      thisWeek: {} as Record<string, any[]>,
      overdue: {} as Record<string, any[]>,
      done: {} as Record<string, any[]>
    };

    const addGroup = (groupObj: Record<string, any[]>, task: any) => {
      const projectName = task.project?.name || 'Khác';
      if (!groupObj[projectName]) groupObj[projectName] = [];
      groupObj[projectName].push(task);
    };

    tasks.forEach(task => {
      if (task.status === 'DONE') {
        addGroup(result.done, task);
        return;
      }
      
      const deadline = task.deadline ? dayjs(task.deadline).startOf('day') : null;
      if (deadline && deadline.isBefore(today)) {
        addGroup(result.overdue, task);
      } else if (deadline && deadline.isSame(today, 'day')) {
        addGroup(result.today, task);
      } else {
        // Assume anything else (future, no deadline) goes to this week
        addGroup(result.thisWeek, task);
      }
    });

    return result;
  }, [tasks]);

  const renderTabContent = (groupedObj: Record<string, any[]>) => {
    const keys = Object.keys(groupedObj);
    if (keys.length === 0) return <Empty description="Không có công việc nào" style={{ padding: '40px 0' }} />;
    return keys.map(projectName => (
      <ProjectGroup key={projectName} title={projectName} groupTasks={groupedObj[projectName]} />
    ));
  };

  const tabItems = [
    { key: '1', label: 'Hôm nay', children: renderTabContent(groupedTasks.today) },
    { key: '2', label: 'Tương lai / Khác', children: renderTabContent(groupedTasks.thisWeek) },
    { key: '3', label: 'Quá hạn', children: renderTabContent(groupedTasks.overdue) },
    { key: '4', label: 'Đã xong', children: renderTabContent(groupedTasks.done) },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
        bodyStyle={{ padding: '32px' }}
      >
        <Title level={3} style={{ marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>Bảng công việc của tôi</Title>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
        ) : (
          <Tabs 
            defaultActiveKey="1" 
            items={tabItems}
            centered
            tabBarStyle={{ marginBottom: '32px' }}
          />
        )}
      </Card>
    </div>
  );
}
