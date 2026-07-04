import React, { useState, type ReactNode } from 'react';
import { Popover, Badge, Button, Avatar, Typography, Empty } from 'antd';
import {
    BellFilled,
    CheckSquareOutlined,
    CommentOutlined,
    ProjectOutlined,
    TeamOutlined,
    PartitionOutlined,
    DeleteOutlined,
    CheckOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification, NotificationType } from '../../types/notification';

const { Text } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getNotificationIcon = (type: NotificationType): ReactNode => {
    const iconStyle = { fontSize: 20 };
    switch (type) {
        case 'TASK_ASSIGNED':
        case 'TASK_UPDATED':
            return <CheckSquareOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
        case 'TASK_COMMENT':
            return <CommentOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
        case 'COMMENT_REPLY':
            return <CommentOutlined style={{ ...iconStyle, color: '#eb2f96' }} />;
        case 'PROJECT_UPDATED':
        case 'PROJECT_ARCHIVED':
            return <ProjectOutlined style={{ ...iconStyle, color: '#faad14' }} />;
        case 'MEMBER_ADDED':
        case 'MEMBER_REMOVED':
            return <TeamOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
        case 'ROADMAP_ITEM_UPDATED':
            return <PartitionOutlined style={{ ...iconStyle, color: '#13c2c2' }} />;
        default:
            return <BellFilled style={{ ...iconStyle, color: '#8c8c8c' }} />;
    }
};

const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

const getNavigationPath = (n: Notification): string | null => {
    if (!n.payload) return null;
    const p = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload;
    if (n.type === 'ROADMAP_ITEM_UPDATED' && p.projectId) return `/projects/${p.projectId}?tab=4`;
    if (p.taskId && p.projectId) {
        if (p.commentId) return `/projects/${p.projectId}?tab=2&highlightTask=${p.taskId}&highlightComment=${p.commentId}`;
        return `/projects/${p.projectId}?tab=2&highlightTask=${p.taskId}`;
    }
    if (p.projectId) return `/projects/${p.projectId}`;
    return null;
};

// ─── Notification Item ─────────────────────────────────────────────────────────

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: number) => void;
    onDelete: (id: number) => void;
    onNavigate: (path: string | null) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead, onDelete, onNavigate }) => {
    const n = notification;
    const unread = !n.is_read;
    const path = getNavigationPath(n);

    const handleClick = () => {
        if (unread) onRead(n.id);
        if (path) {
            const currentUrl = window.location.pathname + window.location.search;
            if (currentUrl === path) {
                // If already on the same path, just trigger the highlight event
                try {
                    const p = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload;
                    if (p && p.commentId) {
                        window.dispatchEvent(new CustomEvent('reHighlightComment', { detail: p.commentId }));
                    }
                } catch (e) { }
            }
            onNavigate(path);
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: unread ? '#e7f3ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.2s',
                marginBottom: 2,
                position: 'relative'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = unread ? '#d0e8ff' : '#f5f5f5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = unread ? '#e7f3ff' : '#ffffff'; }}
        >
            {/* Icon avatar */}
            <Avatar
                style={{ backgroundColor: 'transparent', flexShrink: 0, marginTop: 2 }}
                icon={getNotificationIcon(n.type)}
                size={38}
            />

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: 32 }}>
                <Text
                    strong={unread}
                    style={{
                        display: 'block',
                        fontSize: 13,
                        color: '#111',
                        lineHeight: '1.4',
                        marginBottom: 2,
                        wordBreak: 'break-word',
                    }}
                >
                    {n.type === 'TASK_ASSIGNED' ? (
                        (() => {
                            let pName = 'Không rõ';
                            try {
                                const p = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload;
                                if (p?.projectName) pName = p.projectName;
                            } catch (e) { }
                            return `Dự án: ${pName}`;
                        })()
                    ) : n.title}
                </Text>
                <Text
                    style={{
                        display: 'block',
                        fontSize: 12,
                        color: '#555',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 210,
                    }}
                >
                    {n.type === 'TASK_ASSIGNED'
                        ? 'Bạn vừa được giao cho 1 công việc mới.'
                        : (n.content.length > 60 ? `${n.content.substring(0, 60)}...` : n.content)}
                </Text>
                <Text style={{ fontSize: 11, color: unread ? '#1890ff' : '#999', fontWeight: unread ? 600 : 400 }}>
                    {getTimeAgo(n.created_at)}
                </Text>
            </div>

            {/* Right side indicators and actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'absolute', right: 8 }}>
                <Dropdown
                    menu={{
                        items: [
                            ...(unread ? [{
                                key: 'read',
                                icon: <CheckOutlined />,
                                label: 'Đánh dấu đã đọc',
                                onClick: (e: any) => {
                                    e.domEvent.stopPropagation();
                                    onRead(n.id);
                                }
                            }] : []),
                            {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                danger: true,
                                label: 'Xóa thông báo',
                                onClick: (e: any) => {
                                    e.domEvent.stopPropagation();
                                    onDelete(n.id);
                                }
                            }
                        ]
                    }}
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        icon={<MoreOutlined style={{ fontSize: 16, color: '#8c8c8c' }} />}
                        onClick={e => e.stopPropagation()}
                        style={{ padding: 4 }}
                        className="notif-more-btn"
                    />
                </Dropdown>
                {unread && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1890ff' }} />}
            </div>
        </div>
    );
};

// ─── Dropdown Content ─────────────────────────────────────────────────────────

interface DropdownContentProps {
    onClose: () => void;
}

const DropdownContent: React.FC<DropdownContentProps> = ({ onClose }) => {
    const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const navigate = useNavigate();
    const displayed = notifications.slice(0, 10);

    const handleRead = async (id: number) => {
        await markAsRead([id]);
    };

    const handleDelete = async (id: number) => {
        await deleteNotification(id);
    };

    const handleMarkAll = async () => {
        await markAllAsRead();
    };

    const handleNavigate = (path: string | null) => {
        if (path) {
            navigate(path);
            onClose();
        }
    };

    return (
        <div style={{ width: 340 }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 12px 8px',
                borderBottom: '1px solid #f0f0f0',
                marginBottom: 4,
            }}>
                <Text strong style={{ fontSize: 16 }}>Thông báo</Text>
                <Button
                    type="link"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={handleMarkAll}
                    style={{ padding: 0, fontSize: 12, color: '#1890ff' }}
                >
                    Đọc hết
                </Button>
            </div>

            {/* List */}
            <div style={{ maxHeight: 420, overflowY: 'auto', padding: '0 4px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>Đang tải...</div>
                ) : displayed.length === 0 ? (
                    <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '24px 0' }} />
                ) : (
                    displayed.map(n => (
                        <div key={n.id} className="notif-item-wrap">
                            <NotificationItem
                                notification={n}
                                onRead={handleRead}
                                onDelete={handleDelete}
                                onNavigate={handleNavigate}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
                <Button
                    type="text"
                    block
                    onClick={() => { navigate('/notifications'); onClose(); }}
                    style={{ height: 40, fontWeight: 500, color: '#1890ff', fontSize: 13 }}
                >
                    Xem tất cả thông báo
                </Button>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const NotificationDropdown: React.FC = () => {
    const { unreadCount, resetBadge } = useNotifications();
    const [open, setOpen] = useState(false);

    const handleOpenChange = (visible: boolean) => {
        setOpen(visible);
        // Facebook-style: reset badge to 0 on open (frontend-only, no API call)
        if (visible) {
            resetBadge();
        }
    };

    return (
        <>
            {/* CSS for delete button hover */}
            <style>{`
                .notif-item-wrap .notif-more-btn {
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .notif-item-wrap:hover .notif-more-btn {
                    opacity: 1;
                }
                .notif-popover .ant-popover-inner {
                    padding: 0;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                }
                .notif-popover .ant-popover-arrow {
                    display: none;
                }
            `}</style>

            <Popover
                open={open}
                onOpenChange={handleOpenChange}
                trigger="click"
                placement="bottomRight"
                overlayClassName="notif-popover"
                content={<DropdownContent onClose={() => setOpen(false)} />}
            >
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                    <BellFilled
                        style={{
                            fontSize: 22,
                            cursor: 'pointer',
                            color: open ? '#1890ff' : '#6B7280',
                            transition: 'color 0.2s',
                        }}
                    />
                </Badge>
            </Popover>
        </>
    );
};

export default NotificationDropdown;
