import { Modal, Input, Table, Space, Avatar, Button, Typography, Spin, message } from 'antd';
import { SearchOutlined, PlusOutlined, CheckOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import UserService from '../../services/userService';

const { Text } = Typography;

interface AddMemberModalProps {
  open: boolean;
  onCancel: () => void;
  onAdd: (userId: number) => void;
  projectId?: number;
}

export default function AddMemberModal({ open, onCancel, onAdd, projectId }: AddMemberModalProps) {
  const [searchText, setSearchText] = useState('');
  const [addedMembers, setAddedMembers] = useState<number[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await UserService.getAllUsers(searchText);
      if (response.data) {
        setAvailableUsers(response.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, searchText]);

  const filteredUsers = availableUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = (id: number) => {
    setAddedMembers(prev => [...prev, id]);
    onAdd(id);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <Text type="secondary">{email}</Text>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_: any, record: any) => {
        const isAdded = addedMembers.includes(record.id);
        return (
          <Button
            type={isAdded ? 'default' : 'primary'}
            shape="circle"
            icon={isAdded ? <CheckOutlined style={{ color: '#52c41a' }} /> : <PlusOutlined />}
            onClick={() => !isAdded && handleAdd(record.id)}
            disabled={isAdded}
            style={{}}
          />
        );
      },
    },
  ];

  return (
    <Modal
      title="Add a member"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search Users..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredUsers}
          pagination={{ pageSize: 5 }}
          rowKey="id"
          size="small"
        />
      )}
    </Modal>
  );
}
