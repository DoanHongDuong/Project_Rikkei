import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Typography, Tabs, Dropdown, message, Spin, Tag, Empty } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AuthService from '../../services/authService';
import TaskService from '../../services/taskService';
import type { AuthUser } from '../../types/auth';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = AuthService.getUser();
    setUser(userData);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getTasks();
      setTasks(data || []);
    } catch (error: any) {
      message.error(error.message || 'Lỗi tải công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleMarkAsDone = async (taskId: number) => {
    try {
      await TaskService.updateTaskStatus(taskId, 'DONE');
      message.success('Đã đánh dấu hoàn thành');
      fetchTasks();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const getDropdownMenuItems = (task: any): MenuProps['items'] => [
    { 
      key: '2', 
      label: 'Đánh dấu đã xong',
      icon: <CheckCircleOutlined />,
      disabled: task.status === 'DONE',
      onClick: () => handleMarkAsDone(task.id)
    }
  ];

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
        <Dropdown menu={{ items: getDropdownMenuItems(task) }} trigger={['click']} placement="bottomRight">
          <MoreOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#6B7280' }} />
        </Dropdown>
      </div>
    </Card>
  );

  const { groupedTasks, stats } = useMemo(() => {
    const today = dayjs().startOf('day');
    
    const groups = {
      today: [] as any[],
      thisWeek: [] as any[],
      overdue: [] as any[],
      done: [] as any[]
    };

    let doneCount = 0;
    let overdueCount = 0;
    let inProgressCount = 0;

    tasks.forEach(task => {
      // For stats
      const deadline = task.deadline ? dayjs(task.deadline).startOf('day') : null;
      const isOverdue = deadline && deadline.isBefore(today) && task.status !== 'DONE';

      if (task.status === 'DONE') {
        doneCount++;
      } else if (isOverdue) {
        overdueCount++;
      } else {
        inProgressCount++;
      }

      // For tabs
      if (task.status === 'DONE') {
        groups.done.push(task);
      } else if (isOverdue) {
        groups.overdue.push(task);
      } else if (deadline && deadline.isSame(today, 'day')) {
        groups.today.push(task);
      } else {
        groups.thisWeek.push(task);
      }
    });

    const total = tasks.length;
    const donePercent = total > 0 ? (doneCount / total) * 100 : 0;
    const overduePercent = total > 0 ? (overdueCount / total) * 100 : 0;
    const inProgressPercent = total > 0 ? (inProgressCount / total) * 100 : 0;

    return {
      groupedTasks: groups,
      stats: { total, doneCount, overdueCount, inProgressCount, donePercent, overduePercent, inProgressPercent }
    };
  }, [tasks]);

  if (!user) {
    return <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>;
  }

  const renderTabContent = (taskList: any[]) => {
    if (taskList.length === 0) return <Empty description="Không có công việc nào" style={{ padding: '40px 0' }} />;
    return (
      <Row gutter={[16, 16]}>
        {taskList.map(task => (
          <Col xs={24} sm={12} key={task.id}>
            <TaskCard task={task} />
          </Col>
        ))}
      </Row>
    );
  };

  const tabItems = [
    { key: '1', label: 'Hôm nay', children: renderTabContent(groupedTasks.today) },
    { key: '2', label: 'Tương lai / Khác', children: renderTabContent(groupedTasks.thisWeek) },
    { key: '3', label: 'Quá hạn', children: renderTabContent(groupedTasks.overdue) },
    { key: '4', label: 'Đã xong', children: renderTabContent(groupedTasks.done) },
  ];

  // Logic to render conic gradient dynamically based on stats
  // Order: Completed (Green #68D391), In Progress (Yellow #F6E05E), Overdue (Red #FC8181)
  const p1 = stats.donePercent;
  const p2 = p1 + stats.inProgressPercent;
  // Overdue will be from p2 to 100%

  const conicGradient = `conic-gradient(#68D391 0% ${p1}%, #F6E05E ${p1}% ${p2}%, #FC8181 ${p2}% 100%)`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Left Column: Công việc của tôi */}
        <Col xs={24} lg={16}>
          <Card 
            bordered={false} 
            style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            bodyStyle={{ padding: '24px' }}
          >
            <Title level={4} style={{ marginTop: 0, marginBottom: '20px' }}>Công việc của tôi</Title>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div>
            ) : (
              <Tabs 
                defaultActiveKey="1" 
                items={tabItems}
                tabBarStyle={{ marginBottom: '24px' }}
              />
            )}
          </Card>
        </Col>

        {/* Right Column: Thống kê công việc */}
        <Col xs={24} lg={8}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              height: '100%'
            }}
            bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Title level={4} style={{ marginTop: 0, marginBottom: '40px', textAlign: 'center' }}>Thống kê công việc</Title>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Donut Chart */}
              <div 
                style={{
                  width: '220px',
                  height: '220px',
                  borderRadius: '50%',
                  background: stats.total === 0 ? '#E5E7EB' : conicGradient,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '40px'
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    width: '130px',
                    height: '130px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: '12px', color: '#4B5563', textAlign: 'center', lineHeight: '1.2' }}>Tổng số lượng<br/>công việc</Text>
                  <Title level={2} style={{ margin: '4px 0 0 0' }}>{stats.total}</Title>
                </div>

                {/* Percentage Labels on Chart can be complex to position dynamically, we'll rely on the legend for clarity, or approximate positions */}
                {stats.inProgressCount > 0 && (
                   <span style={{ position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)', color: '#F6E05E', fontWeight: 'bold', fontSize: '14px', textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
                     {stats.inProgressCount} ({stats.inProgressPercent.toFixed(1)}%)
                   </span>
                )}
                {stats.doneCount > 0 && (
                   <span style={{ position: 'absolute', left: '-30px', top: '20%', color: '#68D391', fontWeight: 'bold', fontSize: '14px', textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
                     {stats.doneCount} ({stats.donePercent.toFixed(1)}%)
                   </span>
                )}
                {stats.overdueCount > 0 && (
                   <span style={{ position: 'absolute', left: '50%', bottom: '-20px', transform: 'translateX(-50%)', color: '#FC8181', fontWeight: 'bold', fontSize: '14px', textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
                     {stats.overdueCount} ({stats.overduePercent.toFixed(1)}%)
                   </span>
                )}
              </div>

              {/* Legend */}
              <div style={{ width: '100%', paddingLeft: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#68D391', marginRight: '8px' }}></div>
                  <Text style={{ color: '#4B5563' }}>Hoàn thành: {stats.doneCount}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F6E05E', marginRight: '8px' }}></div>
                  <Text style={{ color: '#4B5563' }}>Đang thực hiện (Tương lai/Hôm nay): {stats.inProgressCount}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FC8181', marginRight: '8px' }}></div>
                  <Text style={{ color: '#4B5563' }}>Quá hạn: {stats.overdueCount}</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}