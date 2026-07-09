import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Button, Space, message, Tag, Avatar, Dropdown, Badge, type MenuProps } from 'antd';
import { BellOutlined, UserOutlined, MoreOutlined } from '@ant-design/icons';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types/notification';
import TaskService from '../../services/taskService';

const { Text } = Typography;

// Định nghĩa payload type để TypeScript không báo lỗi
interface NotificationPayload {
    taskId?: number | string;
    projectId?: number | string;
    projectName?: string;
    assignerName?: string;
    priority?: string;
    status?: string;
    deadline?: string;
}

const getPriorityTag = (priority?: string) => {
    switch (priority) {
        case 'URGENT': return <Tag color="red">Urgent</Tag>;
        case 'HIGH': return <Tag color="orange">High</Tag>;
        case 'MEDIUM': return <Tag color="blue">Medium</Tag>;
        case 'LOW': return <Tag color="green">Low</Tag>;
        default: return null;
    }
};

const getStatusTag = (status?: string) => {
    switch (status) {
        case 'TODO': return <Tag color="default">To Do</Tag>;
        case 'IN_PROGRESS': return <Tag color="processing">In Progress</Tag>;
        case 'DONE': return <Tag color="success">Done</Tag>;
        default: return <Tag color="default">To Do</Tag>;
    }
};

const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Vừa xong';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa gửi';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays <= 7) return `${diffInDays} ngày trước`;

    return date.toLocaleString('vi-VN');
};

const TaskNotificationPopup: React.FC = () => {
    const { notifications, markAsRead } = useNotifications();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [taskNotifications, setTaskNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [pendingReadIds, setPendingReadIds] = useState<number[]>([]);

    // Show popup when new TASK_ASSIGNED unread notifications appear
    useEffect(() => {
        const unreadTaskAssigned = notifications.filter(n => n.type === 'TASK_ASSIGNED' && !n.is_read);
        if (unreadTaskAssigned.length > 0) {
            setTaskNotifications(unreadTaskAssigned);
            setIsModalVisible(true);
        } else if (isModalVisible && unreadTaskAssigned.length === 0) {
            setIsModalVisible(false);
        }
    }, [notifications]);

    const handleMarkAsRead = async () => {
        setLoading(true);
        try {
            const ids = taskNotifications.map(n => n.id);
            await markAsRead(ids);
            message.success('Đã đánh dấu đọc tất cả thông báo công việc!');
            setIsModalVisible(false);
            setTaskNotifications([]);
        } catch (error) {
            message.error('Có lỗi xảy ra khi đánh dấu đọc thông báo.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTask = async (taskId: string | number, notificationId: number) => {
        try {
            await TaskService.updateTaskStatus(taskId, 'IN_PROGRESS');
            message.success('Đã chuyển trạng thái công việc sang In Progress!');

            // Cập nhật giao diện cục bộ thành In Progress
            setTaskNotifications(prev =>
                prev.map(n => {
                    if (n.id === notificationId && n.payload) {
                        try {
                            const p = typeof n.payload === 'string' ? JSON.parse(n.payload) : { ...n.payload };
                            p.status = 'IN_PROGRESS';
                            return { ...n, payload: typeof n.payload === 'string' ? JSON.stringify(p) : p };
                        } catch (e) { }
                    }
                    return n;
                })
            );

            // Đưa vào mảng chờ để tự động đánh dấu đã đọc khi đóng popup
            setPendingReadIds(prev => [...prev, notificationId]);
        } catch (error: unknown) {
            const err = error as { message?: string };
            message.error(err.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    const handleClose = async () => {
        setIsModalVisible(false);
        if (pendingReadIds.length > 0) {
            try {
                await markAsRead(pendingReadIds);
                setTaskNotifications(prev => prev.filter(n => !pendingReadIds.includes(n.id)));
                setPendingReadIds([]);
            } catch (error) { }
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <Badge dot color="red">
                        <BellOutlined style={{ fontSize: '20px', color: '#faad14' }} />
                    </Badge>
                    <span style={{ fontSize: '18px' }}>Thông báo công việc mới</span>
                </Space>
            }
            open={isModalVisible}
            onCancel={handleClose}
            footer={[
                <Button key="later" onClick={handleClose}>
                    Để sau
                </Button>,
                <Button
                    key="read"
                    type="primary"
                    loading={loading}
                    onClick={handleMarkAsRead}
                    style={{ backgroundColor: '#52c41a' }}
                >
                    Xác nhận đã đọc
                </Button>
            ]}
            width={600}
            style={{ top: 30 }}
            className="task-notification-modal" // Thêm class để CSS
        >
            <style>{`
                .task-notification-modal .ant-modal-content {
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes slideDown {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .notification-card {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 12px;
                    border-radius: 8px;
                    padding: 16px;
                    transition: all 0.2s;
                }
                .notification-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    border-color: #cbd5e1;
                }
            `}</style>

            <div style={{ marginTop: 16 }}>
                <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                    Bạn vừa được giao {taskNotifications.length} công việc mới. Vui lòng kiểm tra:
                </Text>

                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                    {Object.entries(
                        taskNotifications.reduce((groups, item) => {
                            let pName = 'Dự án khác';
                            if (item.payload) {
                                try {
                                    const p = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
                                    if (p.projectName) pName = p.projectName;
                                } catch (e) { }
                            }
                            if (!groups[pName]) groups[pName] = [];
                            groups[pName].push(item);
                            return groups;
                        }, {} as Record<string, Notification[]>)
                    ).map(([projectName, projectTasks]) => (
                        <div key={projectName} style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                    {projectName}
                                </Text>
                            </div>

                            <List
                                dataSource={projectTasks}
                                renderItem={(item) => {
                                    let payloadObj: NotificationPayload = {};
                                    if (item.payload) {
                                        try {
                                            payloadObj = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
                                        } catch (e) { }
                                    }

                                    const menuItems: MenuProps['items'] = [
                                        {
                                            key: 'start',
                                            label: 'Bắt đầu ngay',
                                            onClick: () => payloadObj.taskId && handleStartTask(payloadObj.taskId, item.id),
                                            disabled: payloadObj.status === 'IN_PROGRESS' || payloadObj.status === 'DONE'
                                        }
                                    ];

                                    return (
                                        <List.Item style={{ padding: 0, border: 'none' }}>
                                            <div className="notification-card" style={{ width: '100%', marginBottom: 12 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                    <Space>
                                                        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                                                        <div>
                                                            <Text strong style={{ display: 'block', fontSize: '14px' }}>
                                                                {payloadObj.assignerName || 'Người quản lý'}
                                                            </Text>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                {getTimeAgo(item.created_at)}
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                    <Space size={4}>
                                                        {getStatusTag(payloadObj.status)}
                                                        {getPriorityTag(payloadObj.priority)}
                                                        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                                                            <Button type="text" icon={<MoreOutlined />} size="small" style={{ padding: '0 4px', color: '#64748b' }} />
                                                        </Dropdown>
                                                    </Space>
                                                </div>

                                                <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                                                    <Text strong style={{ fontSize: '16px', color: '#1f2937', display: 'block', marginBottom: '8px' }}>
                                                        {item.title}
                                                    </Text>
                                                    <Text style={{ color: '#4b5563', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                                                        {item.content}
                                                    </Text>
                                                    {payloadObj.deadline && (
                                                        <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>
                                                            Hạn chót: <span style={{ color: new Date(payloadObj.deadline) < new Date() ? '#cf1322' : 'inherit' }}>
                                                                {new Date(payloadObj.deadline).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>
                                        </List.Item>
                                    );
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default TaskNotificationPopup;
