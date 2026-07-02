import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Tabs, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import AuthService from '../../services/authService';
import type { AuthUser } from '../../types/auth'; // Đã đưa lên đầu file

const { Title, Text, Paragraph } = Typography;

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const userData = AuthService.getUser();
    setUser(userData);
  }, []);

  if (!user) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Đang tải...</div>;
  }

  const dropdownMenuItems: MenuProps['items'] = [
    { key: '1', label: 'Chi tiết công việc' },
    { key: '2', label: 'Đánh dấu đã xong' }
  ];

  const TaskCard = () => (
    <Card 
      bordered={false} 
      style={{ 
        backgroundColor: '#F3F4F6', 
        borderRadius: '8px',
        marginBottom: '16px'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>dihhhhhhh</Title>
          <Paragraph 
            style={{ 
              color: '#4B5563', 
              fontSize: '12px', 
              marginBottom: '12px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras enim justo, ornare non tellus ut, ornare convallis
          </Paragraph>
          <Text style={{ fontWeight: 500, fontSize: '13px' }}>Hạn chót: 6/7/6767</Text>
        </div>
        <Dropdown menu={{ items: dropdownMenuItems }} trigger={['click']} placement="bottomRight">
          <MoreOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#6B7280' }} />
        </Dropdown>
      </div>
    </Card>
  );

  const tabItems = [
    {
      key: '1',
      label: 'Hôm nay',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}><TaskCard /></Col>
          <Col xs={24} sm={12}><TaskCard /></Col>
          <Col xs={24} sm={12}><TaskCard /></Col>
          <Col xs={24} sm={12}><TaskCard /></Col>
        </Row>
      ),
    },
    { key: '2', label: 'Tuần này', children: <div style={{ padding: '20px 0' }}>Không có công việc nào</div> },
    { key: '3', label: 'Quá hạn', children: <div style={{ padding: '20px 0' }}>Không có công việc nào</div> },
    { key: '4', label: 'Đã xong', children: <div style={{ padding: '20px 0' }}>Không có công việc nào</div> },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Left Column: Công việc của tôi */}
        <Col xs={24} lg={16}>
          <Card 
            bordered={false} 
            style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            bodyStyle={{ padding: '24px' }}
          >
            <Title level={4} style={{ marginTop: 0, marginBottom: '20px' }}>Công việc của tôi</Title>
            <Tabs 
              defaultActiveKey="1" 
              items={tabItems}
              tabBarStyle={{ marginBottom: '24px' }}
            />
          </Card>
        </Col>

        {/* Right Column: Thống kê công việc */}
        <Col xs={24} lg={8}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              height: '100%'
            }}
            bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Title level={4} style={{ marginTop: 0, marginBottom: '40px', textAlign: 'center' }}>Thống kê công việc</Title>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Donut Chart */}
              <div 
                style={{
                  width: '220px',
                  height: '220px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#68D391 0% 54.9%, #F6E05E 54.9% 86.27%, #FC8181 86.27% 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '40px'
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    width: '130px',
                    height: '130px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: '12px', color: '#4B5563', textAlign: 'center', lineHeight: '1.2' }}>Tổng số lượng<br/>công việc</Text>
                  <Title level={2} style={{ margin: '4px 0 0 0' }}>51</Title>
                </div>

                {/* Percentage Labels on Chart */}
                <span style={{ position: 'absolute', left: '185px', top: '120px', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 10 }}>28<br/><span style={{fontSize: '10px', fontWeight: 'normal'}}>54.90%</span></span>
                <span style={{ position: 'absolute', left: '35px', top: '135px', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 10 }}>16<br/><span style={{fontSize: '10px', fontWeight: 'normal'}}>31.37%</span></span>
                <span style={{ position: 'absolute', left: '75px', top: '35px', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 10 }}>7<br/><span style={{fontSize: '10px', fontWeight: 'normal'}}>13.73%</span></span>
              </div>

              {/* Legend */}
              <div style={{ width: '100%', paddingLeft: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F6E05E', marginRight: '8px' }}></div>
                  <Text style={{ color: '#4B5563' }}>Đang thực hiện</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FC8181', marginRight: '8px' }}></div>
                  <Text style={{ color: '#4B5563' }}>Quá hạn</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#68D391', marginRight: '8px' }}></div>
                  <Text style={{ color: '#4B5563' }}>Hoàn thành</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}