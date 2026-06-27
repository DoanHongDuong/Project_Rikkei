import { Typography, Input, Table, Avatar, Space, Button, Modal, message } from 'antd';
import { SearchOutlined, InfoCircleFilled, UserOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface UserData {
  key: string;
  name: string;
  department: string;
  role: string;
}

export default function UserManagement() {
  const navigate = useNavigate();

  const mockUsers: UserData[] = Array.from({ length: 8 }).map((_, index) => ({
    key: String(index),
    name: 'Nguyễn A',
    department: index > 5 ? 'Design' : index > 3 ? 'Marketting' : 'Dev',
    role: index === 0 ? 'Project Manager' : 'Member',
  }));

  const columns: ColumnsType<UserData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: '#ffe6e6', color: '#ff4d4f' }}
          />
          <span>{text}</span>
        </Space>
      ),
      align: 'left',
      width: '40%',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      align: 'left',
      width: '25%',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      align: 'left',
      width: '25%',
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <InfoCircleFilled 
            style={{ color: '#1677ff', fontSize: 18, cursor: 'pointer' }} 
            onClick={() => navigate(`/users/${record.key}`)}
          />
          <DeleteOutlined 
            style={{ color: '#ff4d4f', fontSize: 18, cursor: 'pointer' }} 
            onClick={() => {
              Modal.confirm({
                title: 'Xóa tài khoản',
                content: `Bạn có chắc chắn muốn xóa tài khoản ${record.name}?`,
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                centered: true,
                maskStyle: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.45)' },
                onOk() {
                  message.success(`Đã xóa tài khoản ${record.name}`);
                },
              });
            }}
          />
        </Space>
      ),
      align: 'center',
      width: '10%',
    },
  ];

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 0, fontWeight: 700 }}>
          User Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#2563EB', borderRadius: 4 }}
          onClick={() => navigate('/users/create')}
        />
      </div>

      <div style={{ marginBottom: 24, display: 'flex' }}>
        <Input
          placeholder="Search user..."
          size="large"
          style={{ width: '100%', borderRadius: 4 }}
          suffix={<SearchOutlined style={{ color: '#8c8c8c', fontSize: 18, cursor: 'pointer' }} />}
        />
      </div>

      <Table
        columns={columns}
        dataSource={mockUsers}
        pagination={false}
        bordered={false}
        size="middle"
        components={{
          header: {
            cell: (props: any) => (
              <th {...props} style={{ ...props.style, fontWeight: 'bold', borderBottom: '1px solid #000' }}>
                {props.children}
              </th>
            ),
          },
        }}
      />
    </div>
  );
}
