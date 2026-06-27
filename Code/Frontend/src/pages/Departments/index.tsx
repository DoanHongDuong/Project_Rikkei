import { Typography, Input, Row, Col, Card, Space, Tag } from 'antd';
import { 
  SearchOutlined, 
  TeamOutlined, 
  CheckSquareOutlined, 
  ContainerOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function DepartmentsPage() {
  const departments = [
    { id: 1, name: 'Design', users: 24, activeProjects: 24, openTasks: 24, status: 'Ổn định', color: '#1677ff', statusColor: '#e6f4ff', statusTextColor: '#1677ff' },
    { id: 2, name: 'Developer', users: 24, activeProjects: 24, openTasks: 24, status: 'Quá tải', color: '#52c41a', statusColor: '#ffccc7', statusTextColor: '#ff4d4f' },
    { id: 3, name: 'Marketing', users: 24, activeProjects: 24, openTasks: 24, status: 'Ổn định', color: '#ff4d4f', statusColor: '#e6f4ff', statusTextColor: '#1677ff' },
    { id: 4, name: 'HR', users: 24, activeProjects: 24, openTasks: 24, status: 'Trung bình', color: '#fadb14', statusColor: '#ffffb8', statusTextColor: '#d4b106' },
    { id: 5, name: 'Sales', users: 24, activeProjects: 24, openTasks: 24, status: 'Ổn định', color: '#722ed1', statusColor: '#e6f4ff', statusTextColor: '#1677ff' },
    { id: 6, name: 'QA', users: 24, activeProjects: 24, openTasks: 24, status: 'Ổn định', color: '#13c2c2', statusColor: '#e6f4ff', statusTextColor: '#1677ff' }
  ];

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px', borderRadius: 8 }}>
      <Title level={2} style={{ marginTop: 0, marginBottom: 16, fontWeight: 700 }}>
        Danh sách phòng ban
      </Title>
      
      <div style={{ marginBottom: 32 }}>
        <Input 
          placeholder="Tìm kiếm phòng ban..." 
          size="large"
          style={{ width: '100%', borderRadius: 4 }}
          suffix={<SearchOutlined style={{ color: '#8c8c8c', fontSize: 18, cursor: 'pointer' }} />}
        />
      </div>

      <Row gutter={[24, 24]}>
        {departments.map(dept => (
          <Col xs={24} sm={12} lg={8} key={dept.id}>
            <Card
              bordered={false}
              style={{
                borderRadius: 0,
                borderLeft: `4px solid ${dept.color}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                backgroundColor: '#fafafa'
              }}
              bodyStyle={{ padding: '16px 24px' }}
            >
              <Title level={4} style={{ color: dept.color, marginTop: 0, marginBottom: 16 }}>
                {dept.name}
              </Title>
              
              <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                <Space size={4}>
                  <TeamOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                  <Text style={{ color: '#52c41a', fontWeight: 600 }}>{dept.users}</Text>
                </Space>
                <Space size={4}>
                  <CheckSquareOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                  <Text style={{ color: '#1677ff', fontWeight: 600 }}>{dept.activeProjects}</Text>
                </Space>
                <Space size={4}>
                  <ContainerOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                  <Text style={{ color: '#ff4d4f', fontWeight: 600 }}>{dept.openTasks}</Text>
                </Space>
              </div>

              <div>
                <Tag 
                  style={{ 
                    margin: 0, 
                    border: 'none', 
                    borderRadius: 16, 
                    padding: '2px 12px',
                    backgroundColor: dept.statusColor,
                    color: dept.statusTextColor,
                    fontWeight: 500
                  }}
                >
                  {dept.status}
                </Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
