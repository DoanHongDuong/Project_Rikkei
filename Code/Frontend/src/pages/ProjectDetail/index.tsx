import { Tabs, Typography, Progress, Avatar, Divider, Space, Card, Tag, Button, Modal, Form, Input, Select, DatePicker, Table, message } from 'antd';
import { UserOutlined, UnorderedListOutlined, DesktopOutlined, EditOutlined, InfoCircleOutlined, DeleteOutlined, PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import AddMemberModal from './AddMemberModal';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddMemberVisible, setIsAddMemberVisible] = useState(false);
  const [form] = Form.useForm();

  const handleEditClick = () => {
    form.setFieldsValue({
      name: 'CRM System',
      description: 'This CRM system is designed to manage customer relationships, track sales pipelines, and improve communication across the team.',
      status: 'in_progress',
      deadline: dayjs('2026-08-20'),
    });
    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log('Update project:', values);
      setIsEditModalVisible(false);
    });
  };

  const memberData = [
    { key: '1', name: 'John Doe', role: 'Project Manager', status: 'Active' },
    { key: '2', name: 'Jane Smith', role: 'Developer', status: 'Active' },
    { key: '3', name: 'Bob Johnson', role: 'Designer', status: 'On Leave' },
    { key: '4', name: 'Alice Williams', role: 'Tester', status: 'Active' },
  ];

  const memberColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'Project Manager' ? 'gold' : 'blue'}>{role}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<InfoCircleOutlined />} title="Thông tin" onClick={() => navigate(`/projects/${id}/members/${record.key}`)} />
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
                onOk: () => {
                  message.success('Đã đuổi thành viên khỏi dự án thành công!');
                }
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
        <Card bordered={false} style={{ borderRadius: 8 }}>
          <Title level={4}>Project Overview</Title>
          <Paragraph>
            This CRM system is designed to manage customer relationships, track sales pipelines, and improve communication across the team.
          </Paragraph>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><Text strong>Project Manager:</Text> <Text>John Doe</Text></div>
            <div><Text strong>Current Status:</Text> <Tag color="processing">In Progress</Tag></div>
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
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddMemberVisible(true)} style={{ backgroundColor: '#c41d7f' }}>Thêm thành viên</Button>}
        >
          <Table columns={memberColumns} dataSource={memberData} pagination={false} />
        </Card>
      ),
    },
    {
      key: '4',
      label: 'Roadmap',
      icon: <ProjectOutlined />,
      children: <Card bordered={false} style={{ borderRadius: 8 }}>Roadmap (Coming soon)</Card>,
    },
  ];

  return (
    <div>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>CRM System</Title>
              <Text type="secondary">Customer Relationship Management - Project #{id}</Text>
            </div>
            <Button type="default" icon={<EditOutlined />} onClick={handleEditClick} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>Sửa thông tin</Button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary">Deadline</Text>
            <div><Text strong>20/08/2026</Text></div>
          </div>
        </div>
        
        <Divider style={{ margin: '16px 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            <div style={{ width: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Progress</Text>
                <Text strong>75%</Text>
              </div>
              <Progress percent={75} showInfo={false} strokeColor="#2563EB" />
            </div>
            
            <Divider type="vertical" style={{ height: 40 }} />
            
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Members (12)</Text>
              <Avatar.Group maxCount={4} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Avatar key={i} icon={<UserOutlined />} />
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
              <Option value="planning">Lên kế hoạch</Option>
              <Option value="in_progress">Đang thực hiện</Option>
              <Option value="completed">Đã hoàn thành</Option>
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
        onAdd={(userId) => {
          console.log('Added user:', userId);
        }}
      />
    </div>
  );
}
