import { Row, Col, Card, Typography, Tabs, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function MyTasksPage() {
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

  const ProjectSection = ({ title }: { title: string }) => (
    <div style={{ marginBottom: '24px' }}>
      <Title level={4} style={{ margin: '0 0 16px 0', fontSize: '18px' }}>{title}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}><TaskCard /></Col>
        <Col xs={24} sm={12}><TaskCard /></Col>
      </Row>
    </div>
  );

  const ProjectSection2 = ({ title }: { title: string }) => (
    <div style={{ marginBottom: '24px' }}>
      <Title level={4} style={{ margin: '0 0 16px 0', fontSize: '18px' }}>{title}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}><TaskCard /></Col>
        <Col xs={24} sm={12}><TaskCard /></Col>
        <Col xs={24} sm={12}><TaskCard /></Col>
      </Row>
    </div>
  );

  const tabItems = [
    {
      key: '1',
      label: 'Hôm nay',
      children: (
        <div>
          <ProjectSection title="Abcdefg Mno" />
          <ProjectSection2 title="AbcdEfg Mnk" />
        </div>
      ),
    },
    { key: '2', label: 'Tuần này', children: <div style={{ padding: '20px 0' }}>Không có công việc nào</div> },
    { key: '3', label: 'Quá hạn', children: <div style={{ padding: '20px 0' }}>Không có công việc nào</div> },
    { key: '4', label: 'Đã xong', children: <div style={{ padding: '20px 0' }}>Không có công việc nào</div> },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
        bodyStyle={{ padding: '32px' }}
      >
        <Title level={3} style={{ marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>Bảng công việc của tôi</Title>
        <Tabs 
          defaultActiveKey="1" 
          items={tabItems}
          centered
          tabBarStyle={{ marginBottom: '32px' }}
        />
      </Card>
    </div>
  );
}
