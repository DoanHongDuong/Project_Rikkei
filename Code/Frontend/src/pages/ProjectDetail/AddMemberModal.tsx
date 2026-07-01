import { Modal, Input, Table, Space, Avatar, Button, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, CheckOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text } = Typography;

interface AddMemberModalProps {
  open: boolean;
  onCancel: () => void;
  onAdd: (userId: string) => void;
}

export default function AddMemberModal({ open, onCancel, onAdd }: AddMemberModalProps) {
  const [searchText, setSearchText] = useState('');
  const [addedMembers, setAddedMembers] = useState<string[]>([]);

  // Mock data cho danh sách user có thể thêm vào
  const availableUsers = [
    { id: 'M001', name: 'Nguyễn Văn A', role: 'Developer' },
    { id: 'M002', name: 'Trần Thị B', role: 'Tester' },
    { id: 'M003', name: 'Lê Văn C', role: 'Designer' },
    { id: 'M004', name: 'Phạm Thị D', role: 'Business Analyst' },
    { id: 'M005', name: 'Hoàng Văn E', role: 'Project Manager' },
  ];

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.id.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = (id: string) => {
    setAddedMembers(prev => [...prev, id]);
    onAdd(id);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text type="secondary">{id}</Text>
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
            style={!isAdded ? { backgroundColor: '#c41d7f' } : {}}
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
      <Table
        columns={columns}
        dataSource={filteredUsers}
        pagination={{ pageSize: 5 }}
        rowKey="id"
        size="small"
      />
    </Modal>
  );
}
