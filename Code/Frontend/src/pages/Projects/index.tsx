import { Card, Row, Col, Progress, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ProjectsPage() {
  const navigate = useNavigate();

  const projects = [
    { id: 1, name: 'CRM System', progress: 75, members: 12, deadline: '20/08' },
    { id: 2, name: 'E-Commerce', progress: 45, members: 8, deadline: '15/09' },
    { id: 3, name: 'HR Portal', progress: 90, members: 5, deadline: '01/08' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Projects</Title>
      </div>

      <Row gutter={[24, 24]}>
        {projects.map(project => (
          <Col xs={24} sm={12} lg={8} key={project.id}>
            <Card 
              hoverable 
              style={{ borderRadius: 8 }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <Title level={4}>{project.name}</Title>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Deadline: {project.deadline}</Text>
              </div>
              <Progress percent={project.progress} strokeColor={project.progress > 80 ? '#22C55E' : '#2563EB'} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                  {Array.from({ length: Math.min(project.members, 4) }).map((_, i) => (
                    <Avatar key={i} icon={<UserOutlined />} />
                  ))}
                </Avatar.Group>
                <Text type="secondary">{project.members} Members</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
