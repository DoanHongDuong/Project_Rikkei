import { Tabs, Typography, Progress, Avatar, Divider, Space, Card, Tag, Button, Modal, Form, Input, Select, DatePicker, Table, message, Skeleton } from 'antd';
import { UserOutlined, UnorderedListOutlined, DesktopOutlined, EditOutlined, InfoCircleOutlined, DeleteOutlined, PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import AddMemberModal from './AddMemberModal';
import RoadmapTab from './Roadmap';
import dayjs from 'dayjs';
import AuthService from '../../services/authService';
import ProjectService from '../../services/projectService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab') || '1';
  const highlightTaskId = queryParams.get('highlightTask');

  const [activeTab, setActiveTab] = useState(tabFromQuery);

  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddMemberVisible, setIsAddMemberVisible] = useState(false);
  const [form] = Form.useForm();

  const user = AuthService.getUser();
  const isMember = user?.role === 'MEMBER';

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [projectData, membersData] = await Promise.all([
        ProjectService.getProjectDetail(id),
        ProjectService.getProjectMembers(id)
      ]);
      setProject(projectData);
      setMembers(membersData);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải dữ liệu dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Refetch riêng project (nhẹ hơn loadData) để cập nhật lại % progress
  // ngay khi task thay đổi (đổi status, tạo mới...) mà không cần F5.
  const refreshProjectProgress = async () => {
    if (!id) return;
    try {
      const projectData = await ProjectService.getProjectDetail(id);
      setProject(projectData);
    } catch (error) {
      // im lặng bỏ qua: đây chỉ là refresh nền, không nên làm phiền user
      // bằng message lỗi nếu request phụ này thất bại.
    }
  };

  const handleEditClick = () => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        status: project.status,
        deadline: project.end_date ? dayjs(project.end_date) : null,
      });
      setIsEditModalVisible(true);
    }
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      // TODO: Connect updateProject API
      console.log('Update project:', values);
      setIsEditModalVisible(false);
    });
  };

  const memberColumns = [
    {
      title: 'Tên',
      dataIndex: ['user', 'full_name'],
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong style={{ opacity: record.is_active ? 1 : 0.5 }}>{text || record.user?.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'LEAD' ? 'gold' : 'blue'}>{role}</Tag>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: any) => {
        if (record.user?.status === 'DISABLED') {
          return <Tag color="default">Tài khoản vô hiệu hóa</Tag>;
        }
        return (
          <Tag color={record.is_active ? 'green' : 'red'}>
            {record.is_active ? 'Active' : 'Removed'}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => record.is_active && (
        <Space size="middle">
          <Button type="text" icon={<InfoCircleOutlined />} title="Thông tin" onClick={() => navigate(`/projects/${id}/members/${record.user_id || record.user?.id}`)} />
          {!isMember && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Xóa khỏi dự án"
              onClick={() => {
                Modal.confirm({
                  title: 'Xóa thành viên',
                  content: 'Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?',
                  centered: true,
                  okText: 'Đồng ý',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    if (!id) return;
                    try {
                      const userId = record.user_id || record.user?.id;
                      if (!userId) {
                        message.error('Không tìm thấy thông tin thành viên');
                        return;
                      }
                      await ProjectService.removeProjectMember(id, userId);
                      message.success('Đã xóa thành viên khỏi dự án thành công!');
                      loadData();
                    } catch (error: any) {
                      message.error(error.message || 'Lỗi khi xóa thành viên');
                    }
                  }
                });
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 10 }} /></div>;
  }

  if (!project) {
    return <div style={{ padding: 24 }}>Không tìm thấy dự án!</div>;
  }

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
          extra={!isMember && <Button type="default" icon={<EditOutlined />} onClick={handleEditClick}>Sửa thông tin</Button>}
        >
          <Paragraph>
            {project.description || 'Không có mô tả'}
          </Paragraph>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><Text strong>Project Manager:</Text> <Text>{project.manager?.full_name || 'N/A'}</Text></div>
            <div><Text strong>Trạng thái:</Text> <Tag color="processing">{project.status}</Tag></div>
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: 'Tasks',
      icon: <UnorderedListOutlined />,
      children: <KanbanBoard projectId={id} projectMembers={members} onTasksChanged={refreshProjectProgress} isMember={isMember} highlightTaskId={highlightTaskId} projectEndDate={project.end_date} />,
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
          extra={!isMember && <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddMemberVisible(true)}>Thêm thành viên</Button>}
        >
          <Table columns={memberColumns} dataSource={members} rowKey="id" pagination={false} />
        </Card>
      ),
    },
    {
      key: '4',
      label: 'Roadmap',
      icon: <ProjectOutlined />,
      children: <RoadmapTab isMember={isMember} projectEndDate={project.end_date} projectStartDate={project.start_date} />,
    },
  ];

  const activeMembersCount = members.filter(m => m.is_active).length;

  return (
    <div>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>{project.name}</Title>
              <Text type="secondary">Project #{project.id}</Text>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary">Deadline</Text>
            <div><Text strong>{project.end_date || 'N/A'}</Text></div>
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            <div style={{ width: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Tiến độ</Text>
                <Text strong>{project.progress || 0}%</Text>
              </div>
              <Progress percent={project.progress || 0} showInfo={false} strokeColor="#2563EB" />
            </div>

            <Divider type="vertical" style={{ height: 40 }} />

            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Thành viên ({activeMembersCount})</Text>
              <Avatar.Group maxCount={4} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                {members.filter((m: any) => m.is_active).map((member: any) => {
                  const userName = member.user?.full_name || 'U';
                  return (
                    <Avatar key={member.id || member.user_id} style={{ backgroundColor: '#1890ff' }}>
                      {userName.charAt(0).toUpperCase()}
                    </Avatar>
                  );
                })}
                {activeMembersCount === 0 && <Avatar icon={<UserOutlined />} />}
              </Avatar.Group>
            </div>
          </Space>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} items={items} />

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
              <Option value="ACTIVE">Active</Option>
              <Option value="ON_HOLD">On Hold</Option>
              <Option value="COMPLETED">Completed</Option>
            </Select>
          </Form.Item>
          <Form.Item name="deadline" label="Thời hạn (Deadline)">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>

      <AddMemberModal
        open={isAddMemberVisible}
        onCancel={() => setIsAddMemberVisible(false)}
        onAdd={() => {
          loadData();
        }}
      />
    </div>
  );
}
