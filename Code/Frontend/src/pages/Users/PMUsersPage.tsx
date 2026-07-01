import { Typography, Table, Space, Avatar, Button } from 'antd';
import { SearchOutlined, UserOutlined, InfoCircleFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import '../Dashboard/PMStyles.css';

const { Title } = Typography;

interface UserMockData {
  id: number;
  name: string;
  department: string;
  role: string;
  status: string;
  statusBg: string;
  statusText: string;
}

export default function PMUsersPage() {
  const users: UserMockData[] = [
    { id: 1, name: 'Nguyễn A', department: 'Developer', role: 'PM', status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
    { id: 2, name: 'Nguyễn A', department: 'Marketing', role: 'Member', status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
    { id: 3, name: 'Nguyễn A', department: 'Developer', role: 'PM', status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
    { id: 4, name: 'Nguyễn A', department: 'Developer', role: 'Member', status: 'Quá tải', statusBg: '#FEE2E2', statusText: '#DC2626' },
    { id: 5, name: 'Nguyễn A', department: 'Design', role: 'Member', status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
    { id: 6, name: 'Nguyễn A', department: 'Developer', role: 'Member', status: 'Trung bình', statusBg: '#FEF3C7', statusText: '#D97706' },
    { id: 7, name: 'Nguyễn A', department: 'QA', role: 'Member', status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
    { id: 8, name: 'Nguyễn A', department: 'Developer', role: 'Member', status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
  ];

  const columns: ColumnsType<UserMockData> = [
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
    {
      title: '',
      key: 'action',
      render: () => (
        <Button type="text" icon={<InfoCircleFilled style={{ color: '#1677ff', fontSize: 18 }} />} />
      ),
      width: 60,
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
        />
        <div className="pm-search-icon">
          <SearchOutlined />
        </div>
      </div>

      <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          pagination={false}
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
