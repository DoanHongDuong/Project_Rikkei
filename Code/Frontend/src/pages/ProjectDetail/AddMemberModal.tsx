import { Modal, Input, Table, Space, Avatar, Button, Typography, message, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import ProjectService from '../../services/projectService';
import { useParams } from 'react-router-dom';

const { Text } = Typography;

interface AddMemberModalProps {
  open: boolean;
  onCancel: () => void;
  onAdd: () => void;
}

export default function AddMemberModal({ open, onCancel, onAdd }: AddMemberModalProps) {
  const { id } = useParams();
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.BACKEND_URL}/api/users?status=ACTIVE&limit=100`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Lỗi khi tải danh sách nhân sự');
      }
      const result = await response.json();
      setUsers(result.data?.users || []);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải danh sách nhân sự');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = async (userId: number) => {
    if (!id) return;
    try {
      setAddingId(userId);
      await ProjectService.addProjectMember(id, userId, 'MEMBER');
      message.success('Thêm thành viên thành công!');
      onAdd();
      onCancel();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi thêm thành viên');
    } finally {
      setAddingId(null);
    }
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'full_name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{text || record.email}</Text>
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
      render: (role: string) => <Tag>{role}</Tag>
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_: any, record: any) => {
        return (
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            loading={addingId === record.id}
            onClick={() => handleAdd(record.id)}
          />
        );
      },
    },
  ];

  return (
    <Modal
      title="Thêm thành viên vào dự án"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm người dùng..."
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
        loading={loading}
      />
    </Modal>
  );
}
