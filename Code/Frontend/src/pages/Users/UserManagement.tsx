import React, { useState, useEffect } from 'react';
import { Typography, Input, Table, Avatar, Space, Button, Modal, message, Spin, Tag } from 'antd';
import { SearchOutlined, InfoCircleFilled, UserOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import UserService from '../../services/userService';
import DepartmentService from '../../services/departmentService';

const { Title } = Typography;

interface UserData {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
  department_id: number | null;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchData = async (search: string = '') => {
    setLoading(true);
    try {
      // Fetch users and departments in parallel
      const [usersRes, deptsRes] = await Promise.all([
        UserService.getAllUsers(search),
        DepartmentService.getAll()
      ]);
      if (usersRes) {
        setUsers(usersRes.data || []);
      }
      if (deptsRes && deptsRes.success) {
        setDepartments(deptsRes.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    fetchData(value);
  };

  const getDepartmentName = (id: number | null) => {
    if (!id) return 'Chưa phân bổ';
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'Chưa phân bổ';
  };

  const handleDelete = (user: UserData) => {
    Modal.confirm({
      title: 'Xóa tài khoản',
      content: `Bạn có chắc chắn muốn vô hiệu hóa và xóa tài khoản ${user.full_name}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      maskStyle: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.45)' },
      onOk: async () => {
        try {
          await UserService.deleteUser(user.id);
          message.success(`Đã xóa tài khoản ${user.full_name}`);
          fetchData(searchText);
        } catch (error: any) {
          message.error(error.message || 'Lỗi khi xóa người dùng');
        }
      },
    });
  };

  const columns: ColumnsType<UserData> = [
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: '#ffe6e6', color: '#ff4d4f' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontWeight: 500 }}>{text}</span>
          </div>
        </Space>
      ),
      align: 'left',
      width: '25%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'left',
      width: '25%',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department_id',
      key: 'department',
      render: (deptId) => getDepartmentName(deptId),
      align: 'left',
      width: '15%',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'red' : role === 'PM' ? 'purple' : 'blue'}>
          {role}
        </Tag>
      ),
      align: 'left',
      width: '15%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
      align: 'left',
      width: '10%',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <InfoCircleFilled 
            style={{ color: '#1677ff', fontSize: 18, cursor: 'pointer' }} 
            onClick={() => navigate(`/users/${record.id}`)}
          />
          <DeleteOutlined 
            style={{ color: '#ff4d4f', fontSize: 18, cursor: 'pointer' }} 
            onClick={() => handleDelete(record)}
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
          Quản lý Nhân sự
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#2563EB', borderRadius: 4 }}
          onClick={() => navigate('/users/create')}
        >
          Thêm nhân sự
        </Button>
      </div>

      <div style={{ marginBottom: 24, display: 'flex' }}>
        <Input
          placeholder="Tìm kiếm người dùng (tên, email)..."
          size="large"
          value={searchText}
          onChange={handleSearch}
          style={{ width: '100%', borderRadius: 4 }}
          suffix={<SearchOutlined style={{ color: '#8c8c8c', fontSize: 18, cursor: 'pointer' }} />}
        />
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{ pageSize: 10 }}
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
      </Spin>
    </div>
  );
}
