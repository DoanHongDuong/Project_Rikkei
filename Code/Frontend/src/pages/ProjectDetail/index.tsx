import { Tabs, Typography, Progress, Avatar, Divider, Space, Card, Tag } from 'antd';
import { UserOutlined, SettingOutlined, FileOutlined, UnorderedListOutlined, DesktopOutlined, HistoryOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export default function ProjectDetail() {
  const { id } = useParams();

  const items = [
    {
      key: '1',
      label: 'Overview',
      icon: <DesktopOutlined />,
      children: (
        <Card bordered={false} style={{ borderRadius: 8 }}>
          <Title level={4}>Project Overview</Title>
          <Paragraph>
            This CRM system is designed to manage customer relationships, track sales pipelines, and improve communication across the team.
          </Paragraph>
          <div style={{ marginTop: 24 }}>
            <Text strong>Current Status:</Text> <Tag color="processing">In Progress</Tag>
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: 'Tasks',
      icon: <UnorderedListOutlined />,
      children: <Card bordered={false} style={{ borderRadius: 8 }}>Task List (Coming soon)</Card>,
    },
    {
      key: '3',
      label: 'Members',
      icon: <UserOutlined />,
      children: <Card bordered={false} style={{ borderRadius: 8 }}>Member List (Coming soon)</Card>,
    },
    {
      key: '4',
      label: 'Files',
      icon: <FileOutlined />,
      children: <Card bordered={false} style={{ borderRadius: 8 }}>Files and Attachments (Coming soon)</Card>,
    },
    {
      key: '5',
      label: 'Activity',
      icon: <HistoryOutlined />,
      children: <Card bordered={false} style={{ borderRadius: 8 }}>Recent Activities (Coming soon)</Card>,
    },
    {
      key: '6',
      label: 'Settings',
      icon: <SettingOutlined />,
      children: <Card bordered={false} style={{ borderRadius: 8 }}>Project Settings (Coming soon)</Card>,
    },
  ];

  return (
    <div>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>CRM System</Title>
            <Text type="secondary">Customer Relationship Management - Project #{id}</Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary">Deadline</Text>
            <div><Text strong>20/08/2026</Text></div>
          </div>
        </div>
        
        <Divider style={{ margin: '16px 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            <div style={{ width: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Progress</Text>
                <Text strong>75%</Text>
              </div>
              <Progress percent={75} showInfo={false} strokeColor="#2563EB" />
            </div>
            
            <Divider type="vertical" style={{ height: 40 }} />
            
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Members (12)</Text>
              <Avatar.Group maxCount={4} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Avatar key={i} icon={<UserOutlined />} />
                ))}
              </Avatar.Group>
            </div>
          </Space>
        </div>
      </div>

      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}
