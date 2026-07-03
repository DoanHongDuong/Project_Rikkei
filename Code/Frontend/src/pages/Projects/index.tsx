import { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Avatar, Typography, message, Skeleton } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProjectService from '../../services/projectService';

const { Title, Text } = Typography;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await ProjectService.getProjects();
        setProjects(data || []);
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi tải danh sách dự án');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Projects</Title>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          Bạn chưa tham gia dự án nào.
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {projects.map(project => {
            const progress = project.progress || 0;
            const membersCount = project.members?.length || 0;
            
            return (
              <Col xs={24} sm={12} lg={8} key={project.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 8 }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <Title level={4}>{project.name}</Title>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Deadline: {project.end_date || 'N/A'}</Text>
                  </div>
                  <Progress percent={progress} strokeColor={progress > 80 ? '#22C55E' : '#2563EB'} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                      {project.members && project.members.map((member: any) => {
                        const userName = member.user?.full_name || 'U';
                        return (
                          <Avatar key={member.id || member.user_id} style={{ backgroundColor: '#1890ff' }}>
                            {userName.charAt(0).toUpperCase()}
                          </Avatar>
                        );
                      })}
                      {(!project.members || project.members.length === 0) && <Avatar icon={<UserOutlined />} />}
                    </Avatar.Group>
                    <Text type="secondary">{membersCount} Members</Text>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
