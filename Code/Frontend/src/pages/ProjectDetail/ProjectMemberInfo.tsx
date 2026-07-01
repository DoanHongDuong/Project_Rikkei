import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Avatar, Tag, Button, Row, Col, Card } from 'antd';
import { LeftOutlined, UserOutlined, EnvironmentOutlined, MailOutlined, CheckSquareOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function ProjectMemberInfo() {
  const navigate = useNavigate();
  const { projectId, memberId } = useParams();

  // Mock data dựa trên thiết kế
  const member = {
    id: memberId,
    name: 'George Floyd',
    role: 'Sales',
    location: 'Houston, Texas',
    email: 'gfloyd.cards@gmail.com',
    about: 'Floyd born in Fayetteville, North Carolina, and grew up in Houston, Texas, playing football and basketball throughout high school and college.',
  };

  const tasks = [
    { id: 1, title: 'Set a job', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', assignees: 2, comments: 1 },
    { id: 2, title: 'Set a job', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', assignees: 2, comments: 1 },
    { id: 3, title: 'Set a job', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', assignees: 2, comments: 1 },
    { id: 4, title: 'Set a job', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', assignees: 2, comments: 1 },
  ];

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
            <Avatar size={120} src="https://i.pravatar.cc/150?img=11" icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Title level={4} style={{ margin: 0 }}>{member.name}</Title>
              <Tag color="purple" style={{ borderRadius: 12 }}>{member.role}</Tag>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, textAlign: 'left', color: '#666' }}>
              <div><EnvironmentOutlined style={{ marginRight: 8 }} /> {member.location}</div>
              <div><MailOutlined style={{ marginRight: 8 }} /> {member.email}</div>
            </div>
          </div>

          <div>
            <Title level={5}>Về tôi</Title>
            <Paragraph type="secondary" style={{ fontSize: 14, lineHeight: '1.6' }}>
              {member.about}
            </Paragraph>
          </div>
        </Col>

        {/* Cột phải: Công việc */}
        <Col xs={24} md={16} lg={18}>
          <Title level={5} style={{ marginBottom: 16 }}>Công việc</Title>
          <Row gutter={[16, 16]}>
            {tasks.map(task => (
              <Col xs={24} sm={12} xl={8} key={task.id}>
                <Card 
                  hoverable 
                  style={{ borderRadius: 8, backgroundColor: '#f8f9fa' }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>{task.title}</Title>
                  <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.description}
                  </Paragraph>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Avatar.Group maxCount={3} size="small">
                      <Avatar src="https://i.pravatar.cc/150?img=33" />
                      <Avatar src="https://i.pravatar.cc/150?img=47" />
                    </Avatar.Group>
                    
                    <div style={{ display: 'flex', gap: 12, color: '#888', fontSize: 12 }}>
                      <span><MessageOutlined /> {task.comments}</span>
                      <span><CheckSquareOutlined /> 0/1</span>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
}
