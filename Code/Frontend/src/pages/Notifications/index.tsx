import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Tabs, Button, Avatar, Tag, Empty, Spin, Divider, Dropdown } from 'antd';
import {
    CheckSquareOutlined,
    CommentOutlined,
    ProjectOutlined,
    TeamOutlined,
    PartitionOutlined,
    BellOutlined,
    CheckOutlined,
    MoreOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationService from '../../services/notificationService';
import { getNavigationPath, getTimeAgo } from '../../utils/notificationHelpers';
import type { Notification, NotificationType, NotificationPagination } from '../../types/notification';

const { Title, Text } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getIcon = (type: NotificationType) => {
    const s = { fontSize: 22 };
    switch (type) {
        case 'TASK_ASSIGNED':
        case 'TASK_UPDATED':
            return <CheckSquareOutlined style={{ ...s, color: '#1890ff' }} />;
        case 'TASK_COMMENT':
            return <CommentOutlined style={{ ...s, color: '#52c41a' }} />;
        case 'COMMENT_REPLY':
            return <CommentOutlined style={{ ...s, color: '#eb2f96' }} />;
        case 'PROJECT_UPDATED':
        case 'PROJECT_ARCHIVED':
            return <ProjectOutlined style={{ ...s, color: '#faad14' }} />;
        case 'MEMBER_ADDED':
        case 'MEMBER_REMOVED':
            return <TeamOutlined style={{ ...s, color: '#722ed1' }} />;
        case 'ROADMAP_ITEM_UPDATED':
            return <PartitionOutlined style={{ ...s, color: '#13c2c2' }} />;
        case 'DEADLINE_EXTENSION_REQUESTED':
        case 'DEADLINE_EXTENSION_APPROVED':
        case 'DEADLINE_EXTENSION_REJECTED':
            return <ProjectOutlined style={{ ...s, color: '#fa8c16' }} />;
        default:
            return <BellOutlined style={{ ...s, color: '#8c8c8c' }} />;
    }
};

const getTypeLabel = (type: NotificationType): { text: string; color: string } => {
    const map: Record<string, { text: string; color: string }> = {
        TASK_ASSIGNED: { text: 'Giao việc', color: 'blue' },
        TASK_COMMENT: { text: 'Bình luận', color: 'green' },
        COMMENT_REPLY: { text: 'Phản hồi', color: 'geekblue' },
        TASK_UPDATED: { text: 'Cập nhật', color: 'gold' },
        PROJECT_UPDATED: { text: 'Dự án', color: 'orange' },
        PROJECT_ARCHIVED: { text: 'Đóng dự án', color: 'volcano' },
        MEMBER_ADDED: { text: 'Thành viên', color: 'purple' },
        MEMBER_REMOVED: { text: 'Rời dự án', color: 'magenta' },
        ROADMAP_ITEM_UPDATED: { text: 'Roadmap', color: 'cyan' },
        DEADLINE_EXTENSION_REQUESTED: { text: 'Xin gia hạn', color: 'orange' },
        DEADLINE_EXTENSION_APPROVED: { text: 'Duyệt gia hạn', color: 'lime' },
        DEADLINE_EXTENSION_REJECTED: { text: 'Từ chối gia hạn', color: 'red' },
    };
    return map[type] || { text: type, color: 'default' };
};

const getDateGroup = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d.getTime() === today.getTime()) return 'Hôm nay';
    if (d.getTime() === yesterday.getTime()) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ─── Notification Row ──────────────────────────────────────────────────────────

interface NotifRowProps {
    n: Notification;
    onRead: (id: number) => void;
    onDelete: (id: number) => void;
    onNavigate: (path: string) => void;
}

const NotifRow: React.FC<NotifRowProps> = ({ n, onRead, onDelete, onNavigate }) => {
    const label = getTypeLabel(n.type);
    const unread = !n.is_read;
    const path = getNavigationPath(n);
    const isClickable = !!path;

    return (
        <div
            onClick={() => {
                if (unread) onRead(n.id);
                if (path) {
                    const currentUrl = window.location.pathname + window.location.search;
                    if (currentUrl === path) {
                        try {
                            const p = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload;
                            const commentId = p.commentId || p.comment_id;
                            if (p && commentId) {
                                window.dispatchEvent(new CustomEvent('reHighlightComment', { detail: commentId }));
                            }
                        } catch (e) { }
                    }
                    onNavigate(path);
                }
            }}
            style={{
                display: 'flex',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 10,
                backgroundColor: unread ? '#e7f3ff' : '#fff',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'background 0.2s',
                marginBottom: 4,
                border: '1px solid',
                borderColor: unread ? '#bae0ff' : '#f0f0f0',
                position: 'relative',
                alignItems: 'center',
            }}
            onMouseEnter={e => { if (isClickable) (e.currentTarget as HTMLDivElement).style.backgroundColor = unread ? '#d0e8ff' : '#f5f5f5'; }}
            onMouseLeave={e => { if (isClickable) (e.currentTarget as HTMLDivElement).style.backgroundColor = unread ? '#e7f3ff' : '#fff'; }}
        >
            {/* Icon */}
            <Avatar
                icon={getIcon(n.type)}
                style={{ backgroundColor: 'transparent', flexShrink: 0, marginTop: 2 }}
                size={44}
            />

            {/* Body */}
            <div style={{ flex: 1, paddingRight: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text strong={unread} style={{ fontSize: 14, color: '#111' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                        <Tag color={label.color} style={{ margin: 0, fontSize: 11 }}>{label.text}</Tag>
                    </div>
                </div>
                <Text style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
                    {n.type === 'TASK_ASSIGNED' ? 'Bạn vừa được giao cho 1 công việc mới.' : n.content}
                </Text>
                <Text style={{ fontSize: 12, color: unread ? '#1890ff' : '#999', fontWeight: unread ? 600 : 400 }}>
                    {getTimeAgo(n.created_at)}
                </Text>
            </div>

            {/* Right side indicators and actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'absolute', right: 16 }}>
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
                        icon={<MoreOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />}
                        onClick={e => e.stopPropagation()}
                        style={{ padding: 4 }}
                    />
                </Dropdown>
                {unread && <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#1890ff' }} />}
            </div>
        </div>
    );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [allNotifs, setAllNotifs] = useState<Notification[]>([]);
    const [pagination, setPagination] = useState<NotificationPagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    const fetchPage = useCallback(async (page: number, append = false) => {
        try {
            if (page === 1) setLoading(true); else setLoadingMore(true);
            const result = await NotificationService.getAllNotifications(page, 15);
            setAllNotifs(prev => append ? [...prev, ...result.notifications] : result.notifications);
            setPagination(result.pagination);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchPage(1);
    }, [fetchPage]);

    const handleLoadMore = () => {
        if (pagination && pagination.page < pagination.totalPages) {
            fetchPage(pagination.page + 1, true);
        }
    };

    const handleRead = async (id: number) => {
        await markAsRead([id]);
        setAllNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
    };

    const handleDelete = async (id: number) => {
        await deleteNotification(id);
        setAllNotifs(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAll = async () => {
        await markAllAsRead();
        setAllNotifs(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    };

    const displayed = activeTab === 'unread' ? allNotifs.filter(n => !n.is_read) : allNotifs;

    // Group by date
    const grouped: Record<string, Notification[]> = {};
    for (const n of displayed) {
        const group = getDateGroup(n.created_at);
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(n);
    }

    const hasMore = pagination ? pagination.page < pagination.totalPages : false;

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '8px 0 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>Thông báo</Title>
                <Button
                    icon={<CheckOutlined />}
                    onClick={handleMarkAll}
                    style={{ borderRadius: 8 }}
                >
                    Đánh dấu tất cả đã đọc
                </Button>
            </div>

            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as 'all' | 'unread')}
                style={{ marginBottom: 16 }}
                items={[
                    { key: 'all', label: 'Tất cả' },
                    { key: 'unread', label: `Chưa đọc (${allNotifs.filter(n => !n.is_read).length})` },
                ]}
            />

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
            ) : Object.keys(grouped).length === 0 ? (
                <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ paddingTop: 48 }} />
            ) : (
                <>
                    {Object.entries(grouped).map(([group, items]) => (
                        <div key={group} style={{ marginBottom: 24 }}>
                            <Divider titlePlacement="left" plain style={{ margin: '16px 0 10px 0' }}>
                                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {group}
                                </Text>
                            </Divider>
                            {items.map(n => (
                                <NotifRow
                                    key={n.id}
                                    n={n}
                                    onRead={handleRead}
                                    onDelete={handleDelete}
                                    onNavigate={(path) => navigate(path)}
                                />
                            ))}
                        </div>
                    ))}

                    {/* Load more */}
                    {hasMore && activeTab === 'all' && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Button
                                loading={loadingMore}
                                onClick={handleLoadMore}
                                style={{ borderRadius: 8, minWidth: 200 }}
                            >
                                Xem thêm thông báo
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NotificationsPage;
