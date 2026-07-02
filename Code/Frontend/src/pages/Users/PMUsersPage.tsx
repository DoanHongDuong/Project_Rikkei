import { useState, useEffect } from 'react';
import { Typography, Table, Space, Avatar, Button, message } from 'antd';
import { SearchOutlined, UserOutlined, InfoCircleFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import AuthService from '../../services/authService';
import DepartmentService from '../../services/departmentService';
import '../Dashboard/PMStyles.css';

const { Title } = Typography;

interface UserData {
  id: number;
  name: string;
  department: string;
  role: string;
  status: string;
  statusBg: string;
  statusText: string;
}

export default function PMUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getUser();
      if (!currentUser?.department_id) {
        message.warning('Tài khoản của bạn chưa được gán phòng ban');
        return;
      }
      
      const response = await DepartmentService.getMembers(currentUser.department_id);
      
      if (response.success && response.data) {
        const mappedUsers: UserData[] = response.data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.email,
          department: response.department || 'N/A',
          role: u.role,
          status: u.status,
          statusBg: u.status === 'ACTIVE' ? '#E0F2FE' : '#FEE2E2',
          statusText: u.status === 'ACTIVE' ? '#0284C7' : '#DC2626',
        }));
        setUsers(mappedUsers);
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách nhân sự');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<UserData> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ffccc7', color: '#ff4d4f' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <span style={{ 
          backgroundColor: record.statusBg, 
          color: record.statusText, 
          padding: '4px 12px', 
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 500
        }}>
          {record.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>Danh sách nhân sự</Title>
      
      <div className="pm-search-container" style={{ marginBottom: 30 }}>
        <input 
          type="text" 
          className="pm-search-input" 
          placeholder="Tìm kiếm nhân sự..." 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="pm-search-icon">
          <SearchOutlined />
        </div>
      </div>

      <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
        <Table 
          columns={columns} 
          dataSource={filteredUsers} 
          rowKey="id" 
          pagination={false}
          loading={loading}
          components={{
            header: {
              cell: (props: any) => (
                <th {...props} style={{ ...props.style, fontWeight: 'bold', borderBottom: '2px solid #000' }}>
                  {props.children}
                </th>
              ),
            },
          }}
        />
      </div>
    </div>
  );
}
