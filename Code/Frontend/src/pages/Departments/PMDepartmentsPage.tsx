import { Typography, Row, Col, Card } from 'antd';
import { SearchOutlined, UserOutlined, CheckSquareOutlined, CloseSquareOutlined } from '@ant-design/icons';
// import '../Dashboard/PMStyles.css';

const { Title } = Typography;

export default function PMDepartmentsPage() {
  const departments = [
    { id: 1, name: 'Design', nameColor: '#3B82F6', active: 24, completed: 24, issues: 24, status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
    { id: 2, name: 'Developer', nameColor: '#10B981', active: 24, completed: 24, issues: 24, status: 'Quá tải', statusBg: '#FEE2E2', statusText: '#DC2626' },
    { id: 3, name: 'Marketing', nameColor: '#EF4444', active: 24, completed: 24, issues: 24, status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
    { id: 4, name: 'HR', nameColor: '#F59E0B', active: 24, completed: 24, issues: 24, status: 'Trung bình', statusBg: '#FEF3C7', statusText: '#D97706' },
    { id: 5, name: 'Sales', nameColor: '#D946EF', active: 24, completed: 24, issues: 24, status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
    { id: 6, name: 'QA', nameColor: '#06B6D4', active: 24, completed: 24, issues: 24, status: 'Ổn định', statusBg: '#E0F2FE', statusText: '#0284C7' },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 20 }}>Danh sách phòng ban</Title>

      <div className="pm-search-container" style={{ marginBottom: 30 }}>
        <input
          type="text"
          className="pm-search-input"
          placeholder="Tìm kiếm phòng ban..."
        />
        <div className="pm-search-icon">
          <SearchOutlined />
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {departments.map(dept => (
          <Col xs={24} sm={12} lg={8} key={dept.id}>
            <Card
              hoverable
              style={{ borderRadius: 8, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, color: dept.nameColor, marginBottom: '20px' }}>
                  {dept.name}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#10B981', fontWeight: 500 }}>
                    <UserOutlined style={{ marginRight: 4 }} /> {dept.active}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#3B82F6', fontWeight: 500 }}>
                    <CheckSquareOutlined style={{ marginRight: 4 }} /> {dept.completed}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#EF4444', fontWeight: 500 }}>
                    <CloseSquareOutlined style={{ marginRight: 4 }} /> {dept.issues}
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <span style={{
                    backgroundColor: dept.statusBg,
                    color: dept.statusText,
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    {dept.status}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
