import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Avatar, Tag, Button, Row, Col, Card, Spin, Empty, message } from 'antd';
import { LeftOutlined, UserOutlined, MailOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import ProjectService from '../../services/projectService';
import TaskService from '../../services/taskService';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

export default function ProjectMemberInfo() {
  const navigate = useNavigate();
  const { projectId, memberId } = useParams();

  const [member, setMember] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !memberId) return;
      try {
        setLoading(true);
        // Lấy danh sách thành viên dự án và tìm thành viên theo memberId
        const members = await ProjectService.getProjectMembers(projectId);
        const found = (members || []).find(
          (m: any) => String(m.user_id) === String(memberId)
        );
        setMember(found || null);

        // Lấy task của thành viên trong project này
        const taskData = await TaskService.getTasks({
          project_id: projectId,
          assignee_id: memberId
        });
        setTasks(Array.isArray(taskData) ? taskData : taskData?.tasks || []);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải thông tin thành viên');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, memberId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'success';
      case 'IN_PROGRESS': return 'processing';
      case 'TODO': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ padding: 24 }}>
        <Button type="text" icon={<LeftOutlined />} onClick={() => navigate(`/projects/${projectId}`)}>Trở về</Button>
        <Empty description="Không tìm thấy thành viên này" style={{ marginTop: 40 }} />
      </div>
    );
  }

  const user = member.user || {};
  const roleBadge = member.role || 'MEMBER';

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate(`/projects/${projectId}`)}
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
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{ marginBottom: 16, backgroundColor: '#1677ff' }}
            >
              {user.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Title level={4} style={{ margin: 0 }}>{user.full_name || 'N/A'}</Title>
              <Tag color="purple" style={{ borderRadius: 12 }}>{roleBadge}</Tag>
            </div>
            {!member.is_active && (
              <Tag color="red" style={{ marginBottom: 8 }}>Đã rời dự án</Tag>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, textAlign: 'left', color: '#666' }}>
              <div><MailOutlined style={{ marginRight: 8 }} />{user.email || 'N/A'}</div>
            </div>
          </div>

          <div>
            <Title level={5}>Thông tin</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><Text type="secondary">Vai trò hệ thống:</Text> <Tag>{user.role}</Tag></div>
              <div><Text type="secondary">Ngày tham gia:</Text> <Text>{member.joined_at ? dayjs(member.joined_at).format('DD/MM/YYYY') : 'N/A'}</Text></div>
              {member.left_at && (
                <div><Text type="secondary">Ngày rời:</Text> <Text>{dayjs(member.left_at).format('DD/MM/YYYY')}</Text></div>
              )}
            </div>
          </div>
        </Col>

        {/* Cột phải: Công việc */}
        <Col xs={24} md={16} lg={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0 }}>Công việc trong dự án ({tasks.length})</Title>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag color="success">Hoàn thành: {tasks.filter(t => t.status === 'DONE').length}</Tag>
              <Tag color="processing">Đang làm: {tasks.filter(t => t.status === 'IN_PROGRESS').length}</Tag>
              <Tag color="default">Chưa làm: {tasks.filter(t => t.status === 'TODO').length}</Tag>
            </div>
          </div>

          {tasks.length === 0 ? (
            <Empty description="Thành viên này chưa có công việc nào trong dự án" />
          ) : (
            <Row gutter={[16, 16]}>
              {tasks.map(task => (
                <Col xs={24} sm={12} xl={8} key={task.id}>
                  <Card
                    hoverable
                    style={{ borderRadius: 8, backgroundColor: '#f8f9fa' }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <Title level={5} style={{ marginTop: 0, marginBottom: 8, textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>
                      {task.title}
                    </Title>
                    <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {task.description || 'Không có mô tả'}
                    </Paragraph>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Tag color={getStatusColor(task.status)} style={{ fontSize: 11 }}>{task.status}</Tag>
                        <Tag color={getPriorityColor(task.priority)} style={{ fontSize: 11 }}>{task.priority}</Tag>
                      </div>
                      {task.deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: 11 }}>
                          <CheckSquareOutlined />
                          <span>{dayjs(task.deadline).format('DD/MM/YYYY')}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
}
