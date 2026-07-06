import { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Avatar, Typography, Button, message, Skeleton, Popconfirm } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { DeleteOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/authService';
import ProjectService from '../../services/projectService';
import '../Dashboard/PMStyles.css';

const { Title, Text } = Typography;

export default function PMProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = AuthService.getUser();

  const fetchProjects = async () => {
    try {
      const data = await ProjectService.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (id: number) => {
    try {
      await ProjectService.deleteProject(id);
      message.success('Xóa dự án thành công');
      await fetchProjects();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xóa dự án');
    }
  };

  return (
    <div>
      <div className="pm-page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1E3A5F' }}>{t('page.projects.title')}</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/projects/create')}
          size="large"
          className="pm-btn-primary"
        >
          {t('page.projects.create')}
        </Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: 12 }}>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>{t('page.projects.no_project_pm')}</Text>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Title level={4}>{project.name}</Title>
                    {user?.role === 'PM' && (
                      <Popconfirm
                        title="Xóa dự án"
                        description="Bạn có chắc chắn muốn xóa dự án này?"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Có"
                        cancelText="Không"
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#ff4d4f', cursor: 'pointer', padding: '4px' }}
                        >
                          <DeleteOutlined />
                        </div>
                      </Popconfirm>
                    )}
                  </div>
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
