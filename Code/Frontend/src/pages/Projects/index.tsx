import { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Avatar, Typography, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProjectService from '../../services/projectService';
import type { Project } from '../../types/project';

const { Title, Text } = Typography;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await ProjectService.getProjects({
        page: 1,
        limit: 10,
        search: '',
        status: '',
        manager_id: ''
      });
      setProjects(result.projects);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

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
                <Text type="secondary">Deadline: {project.end_date || 'N/A'}</Text>
              </div>
              <Progress percent={50} strokeColor={project.status === 'COMPLETED' ? '#22C55E' : '#2563EB'} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                  <Avatar icon={<UserOutlined />} />
                </Avatar.Group>
                <Text type="secondary">Manager: {project.manager?.full_name || 'N/A'}</Text>
              </div>
            </Card>
          </Col>
        ))}
        {!projects.length && !loading && (
          <Col span={24}>
            <div style={{ textAlign: 'center', color: '#888' }}>Không có dự án nào.</div>
          </Col>
        )}
      </Row>
    </div>
  );
}
