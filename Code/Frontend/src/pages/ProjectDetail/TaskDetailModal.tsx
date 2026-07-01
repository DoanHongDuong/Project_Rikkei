import { Modal, Typography, Avatar, Space, Button, Divider, List, Input } from 'antd';
import { LeftOutlined, UserOutlined, DeleteOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TaskDetailModalProps {
  open: boolean;
  onCancel: () => void;
  taskTitle: string;
  onEditClick: () => void;
}

export default function TaskDetailModal({ open, onCancel, taskTitle, onEditClick }: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState('');

  const comments = [
    {
      id: 1,
      author: 'P. Diddy',
      avatar: 'https://i.pravatar.cc/150?img=11',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      datetime: '2 hours ago',
    },
    {
      id: 2,
      author: 'Charlie Kirk',
      avatar: 'https://i.pravatar.cc/150?img=12',
      content: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
      datetime: '1 hour ago',
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      closeIcon={null} // Hide default close icon
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={onCancel}
            style={{ fontSize: 16, fontWeight: 500, paddingLeft: 0 }}
          >
            Trở về <span style={{ marginLeft: 8 }}>Chi tiết công việc</span>
          </Button>
          <Space>
            <Button icon={<EditOutlined />} onClick={onEditClick}>Sửa task</Button>
            <Button danger icon={<DeleteOutlined />}>Xóa việc</Button>
          </Space>
        </div>
      }
    >
      <div style={{ marginTop: 24 }}>
        <Title level={3}>{taskTitle}</Title>
        
        <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Mô tả</Title>
        <Paragraph type="secondary" style={{ fontSize: 14 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </Paragraph>
        
        <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Hạn chót</Title>
        <Text>9/11/2001</Text>
        
        <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Người thực hiện</Title>
        <Space size="large">
          <Space>
            <Avatar src="https://i.pravatar.cc/150?img=11" icon={<UserOutlined />} />
            <Text>P. Diddy</Text>
          </Space>
          <Space>
            <Avatar src="https://i.pravatar.cc/150?img=12" icon={<UserOutlined />} />
            <Text>Charlie Kirk</Text>
          </Space>
        </Space>
        
        <Divider style={{ margin: '24px 0' }} />
        
        <Title level={5} style={{ marginBottom: 16 }}>Bình luận</Title>
        <List
          dataSource={comments}
          renderItem={item => (
            <List.Item style={{ padding: '12px 0', borderBottom: 'none' }}>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} />}
                title={<Space><Text strong>{item.author}</Text> <Text type="secondary" style={{ fontSize: 12 }}>{item.datetime}</Text></Space>}
                description={<Text style={{ color: '#333' }}>{item.content}</Text>}
              />
            </List.Item>
          )}
        />
        
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Avatar src="https://i.pravatar.cc/150?img=33" />
          <div style={{ flex: 1, position: 'relative' }}>
            <TextArea 
              rows={2} 
              placeholder="Nhập bình luận..." 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              style={{ borderRadius: 8, paddingRight: 40 }}
            />
            <Button 
              type="text" 
              icon={<SendOutlined style={{ color: '#1890ff' }} />} 
              style={{ position: 'absolute', right: 4, bottom: 4 }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
