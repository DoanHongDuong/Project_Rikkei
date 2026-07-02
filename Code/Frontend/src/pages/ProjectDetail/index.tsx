import { Tabs, Typography, Progress, Avatar, Divider, Space, Card, Tag, Button, Modal, Form, Input, Select, DatePicker, Table, message, Spin } from 'antd';
import { UserOutlined, UnorderedListOutlined, DesktopOutlined, EditOutlined, InfoCircleOutlined, DeleteOutlined, PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import AddMemberModal from './AddMemberModal';
import RoadmapTab from './Roadmap';
import dayjs from 'dayjs';
import ProjectService from '../../services/projectService';
import type { Project, ProjectMember } from '../../types/project';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddMemberVisible, setIsAddMemberVisible] = useState(false);
  const [form] = Form.useForm();
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjectData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const project = await ProjectService.getProjectById(Number(id));
      setProjectData(project);

      const projectMembers = await ProjectService.getProjectMembers(Number(id));
      setMembers(projectMembers);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải thông tin dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleEditClick = () => {
    if (!projectData) return;
    form.setFieldsValue({
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
      deadline: projectData.end_date ? dayjs(projectData.end_date) : null,
    });
    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      if (!id) return;
      try {
        await ProjectService.updateProject(Number(id), {
          name: values.name,
          description: values.description,
          status: values.status,
          end_date: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
        });
        message.success('Cập nhật thông tin dự án thành công');
        setIsEditModalVisible(false);
        loadProjectData();
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi cập nhật thông tin dự án');
      }
    });
  };

  const handleAddMember = async (userId: number) => {
    if (!id) return;
    try {
      await ProjectService.addProjectMember(Number(id), { user_id: userId, role: 'MEMBER' });
      message.success('Thêm thành viên thành công');
      setIsAddMemberVisible(false);
      loadProjectData();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi thêm thành viên');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!id) return;
    try {
      await ProjectService.removeProjectMember(Number(id), userId);
      message.success('Xóa thành viên thành công');
      loadProjectData();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xóa thành viên');
    }
  };

  const memberColumns = [
    {
      title: 'Name',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{user?.full_name || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'PM' ? 'gold' : 'blue'}>{role}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<InfoCircleOutlined />} title="Thông tin" onClick={() => navigate(`/projects/${id}/members/${record.user_id}`)} />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            title="Xóa khỏi dự án"
            onClick={() => {
              Modal.confirm({
                title: 'Xóa thành viên',
                content: 'Bạn có chắc chắn muốn đuổi thành viên này khỏi dự án?',
                centered: true,
                okText: 'Đồng ý',
                cancelText: 'Hủy',
                onOk: () => handleRemoveMember(record.user_id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: '1',
      label: 'Overview',
      icon: <DesktopOutlined />,
      children: (
        <Card 
          bordered={false} 
          style={{ borderRadius: 8 }}
          title={<Title level={4} style={{ margin: 0 }}>Project Overview</Title>}
          extra={<Button type="default" icon={<EditOutlined />} onClick={handleEditClick}>Sửa thông tin</Button>}
        >
          <Paragraph>
            {projectData?.description || 'Chưa có mô tả cho dự án này.'}
          </Paragraph>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><Text strong>Project Manager:</Text> <Text>{projectData?.manager?.full_name || 'N/A'}</Text></div>
            <div>
              <Text strong>Current Status:</Text>{' '}
              <Tag color={projectData?.status === 'ACTIVE' ? 'processing' : projectData?.status === 'COMPLETED' ? 'success' : 'default'}>
                {projectData?.status || 'N/A'}
              </Tag>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: 'Tasks',
      icon: <UnorderedListOutlined />,
      children: <KanbanBoard />,
    },
    {
      key: '3',
      label: 'Members',
      icon: <UserOutlined />,
      children: (
        <Card 
          bordered={false} 
          style={{ borderRadius: 8 }}
          title="Danh sách thành viên"
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddMemberVisible(true)}>Thêm thành viên</Button>}
        >
          <Table columns={memberColumns} dataSource={members} pagination={false} rowKey="id" />
        </Card>
      ),
    },
    {
      key: '4',
      label: 'Roadmap',
      icon: <ProjectOutlined />,
      children: <RoadmapTab />,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải thông tin dự án..." />
      </div>
    );
  }

  if (!projectData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text type="danger" style={{ fontSize: '16px' }}>Không tìm thấy thông tin dự án.</Text>
      </div>
    );
  }

  return (
    <div>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>{projectData.name}</Title>
              <Text type="secondary">{projectData.description || 'Chưa có mô tả'} - Project #{id}</Text>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary">Deadline</Text>
            <div><Text strong>{projectData.end_date ? dayjs(projectData.end_date).format('DD/MM/YYYY') : 'N/A'}</Text></div>
          </div>
        </div>
        
        <Divider style={{ margin: '16px 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            <div style={{ width: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Progress</Text>
                <Text strong>{projectData.status === 'COMPLETED' ? '100%' : '75%'}</Text>
              </div>
              <Progress percent={projectData.status === 'COMPLETED' ? 100 : 75} showInfo={false} strokeColor="#2563EB" />
            </div>
            
            <Divider type="vertical" style={{ height: 40 }} />
            
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Members ({members.length})</Text>
              <Avatar.Group maxCount={4} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                {members.map((member, i) => (
                  <Avatar key={member.id || i} icon={<UserOutlined />} title={member.user?.full_name} />
                ))}
              </Avatar.Group>
            </div>
          </Space>
        </div>
      </div>

      <Tabs defaultActiveKey="1" items={items} />

      <Modal
        title="Sửa thông tin dự án"
        open={isEditModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="ACTIVE">Hoạt động (ACTIVE)</Option>
              <Option value="ON_HOLD">Tạm dừng (ON_HOLD)</Option>
              <Option value="COMPLETED">Hoàn thành (COMPLETED)</Option>
              <Option value="ARCHIVED">Lưu trữ (ARCHIVED)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="deadline" label="Thời hạn (Deadline)">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      <AddMemberModal 
        open={isAddMemberVisible} 
        onCancel={() => setIsAddMemberVisible(false)} 
        onAdd={handleAddMember}
      />
    </div>
  );
}
