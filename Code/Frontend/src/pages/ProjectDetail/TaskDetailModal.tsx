import { Modal, Typography, Avatar, Space, Button, Divider, List, Input, Skeleton, Tag, message } from 'antd';
import { LeftOutlined, UserOutlined, DeleteOutlined, EditOutlined, SendOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import TaskService from '../../services/taskService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TaskDetailModalProps {
  open: boolean;
  onCancel: () => void;
  taskId: string | number;
  onEditClick: () => void;
  onDeleteSuccess?: () => void;
}

export default function TaskDetailModal({ open, onCancel, taskId, onEditClick, onDeleteSuccess }: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open && taskId) {
      loadTask();
    }
  }, [open, taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getTaskDetail(taskId);
      setTask(data);
    } catch (error: any) {
      console.error('Lỗi tải task:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa công việc',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: `Bạn có chắc chắn muốn xóa công việc "${task?.title}" không? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      okButtonProps: { loading: deleting },
      onOk: async () => {
        try {
          setDeleting(true);
          await TaskService.deleteTask(taskId);
          message.success('Đã xóa công việc thành công');
          onCancel();
          onDeleteSuccess?.();
        } catch (error: any) {
          message.error(error.message || 'Lỗi khi xóa công việc');
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  const priorityColor: Record<string, string> = {
    LOW: 'green',
    MEDIUM: 'blue',
    HIGH: 'orange',
    URGENT: 'red',
  };

  const statusColor: Record<string, string> = {
    TODO: 'default',
    IN_PROGRESS: 'processing',
    DONE: 'success',
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      closeIcon={null}
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
            <Button danger icon={<DeleteOutlined />} loading={deleting} onClick={handleDelete}>Xóa việc</Button>
          </Space>
        </div>
      }
    >
      <div style={{ marginTop: 24 }}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : task ? (
          <>
            <Title level={3}>{task.title}</Title>

            <Space style={{ marginBottom: 16 }}>
              <Tag color={statusColor[task.status] || 'default'}>{task.status?.replace('_', ' ')}</Tag>
              <Tag color={priorityColor[task.priority] || 'default'}>{task.priority}</Tag>
            </Space>
            
            <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>Mô tả</Title>
            <Paragraph type="secondary" style={{ fontSize: 14 }}>
              {task.description || 'Không có mô tả'}
            </Paragraph>
            
            <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Hạn chót</Title>
            <Text>{task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'Chưa đặt'}</Text>
            
            <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Người thực hiện</Title>
            {task.assignee ? (
              <Space>
                <Avatar icon={<UserOutlined />} />
                <Text>{task.assignee.full_name || task.assignee.email}</Text>
              </Space>
            ) : (
              <Text type="secondary">Chưa được phân công</Text>
            )}

            <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Người tạo</Title>
            {task.creator && (
              <Space>
                <Avatar icon={<UserOutlined />} />
                <Text>{task.creator.full_name || task.creator.email}</Text>
              </Space>
            )}
          </>
        ) : (
          <Text type="secondary">Không tìm thấy thông tin task.</Text>
        )}
        
        <Divider style={{ margin: '24px 0' }} />
        
        <Title level={5} style={{ marginBottom: 16 }}>Bình luận</Title>
        <List dataSource={[]} renderItem={() => <></>} locale={{ emptyText: 'Chưa có bình luận' }} />
        
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Avatar icon={<UserOutlined />} />
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

