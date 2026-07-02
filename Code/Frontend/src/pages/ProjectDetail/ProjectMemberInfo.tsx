import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Avatar, Tag, Button, Row, Col, Card, Spin, message } from 'antd';
import { LeftOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import UserService from '../../services/userService';
import TaskService from '../../services/taskService';

const { Title, Paragraph } = Typography;

export default function ProjectMemberInfo() {
  const navigate = useNavigate();
  const { projectId, memberId } = useParams();

  const [userData, setUserData] = useState<any>(null);
  const [memberTasks, setMemberTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !memberId) return;
      try {
        setLoading(true);
        const [userRes, tasksRes] = await Promise.all([
          UserService.getUserById(memberId),
          TaskService.getTasks(projectId)
        ]);
        
        if (userRes.data) setUserData(userRes.data);
        
        const assignedTasks = tasksRes.filter((t: any) => t.assignee_id === Number(memberId));
        setMemberTasks(assignedTasks);
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, memberId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!userData) {
    return (
      <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px', borderRadius: 8 }}>
        <Button type="text" icon={<LeftOutlined />} onClick={() => navigate(`/projects/${projectId || 1}`)}>Trở về</Button>
        <div style={{ marginTop: 24 }}>Không tìm thấy thông tin thành viên</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={() => navigate(`/projects/${projectId || 1}`)}
          style={{ fontSize: 16, fontWeight: 500, marginRight: 16 }}
        >
          Trở về
        </Button>
        <Title level={3} style={{ margin: 0 }}>Thông tin thành viên</Title>
      </div>

      <Row gutter={[48, 24]}>
        {/* Cột trái: Thông tin cá nhân */}
        <Col xs={24} md={8} lg={6}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: 16, backgroundColor: '#f0f0f0', color: '#8c8c8c' }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Title level={4} style={{ margin: 0 }}>{userData.full_name}</Title>
              <Tag color="purple" style={{ borderRadius: 12 }}>{userData.role}</Tag>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, textAlign: 'left', color: '#666' }}>
              <div><MailOutlined style={{ marginRight: 8 }} /> {userData.email}</div>
            </div>
          </div>
        </Col>

        {/* Cột phải: Công việc */}
        <Col xs={24} md={16} lg={18}>
          <Title level={5} style={{ marginBottom: 16 }}>Công việc đang đảm nhận</Title>
          <Row gutter={[16, 16]}>
            {memberTasks.length > 0 ? (
              memberTasks.map(task => (
                <Col xs={24} sm={12} xl={8} key={task.id}>
                  <Card 
                    hoverable 
                    style={{ borderRadius: 8, backgroundColor: '#f8f9fa' }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>{task.name || task.title}</Title>
                    <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {task.description || 'Không có mô tả'}
                    </Paragraph>
                    <Tag color={task.status === 'DONE' ? 'green' : (task.status === 'IN_PROGRESS' ? 'processing' : 'default')}>
                      {task.status}
                    </Tag>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ padding: '20px 0', color: '#888' }}>Thành viên này chưa có công việc nào trong dự án.</div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </div>
  );
}
