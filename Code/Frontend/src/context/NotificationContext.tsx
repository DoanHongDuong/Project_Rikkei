import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Notification } from '../types/notification';
import NotificationService from '../services/notificationService';
import socketService from '../services/socketService';

interface NotificationContextValue {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    resetBadge: () => void;
    markAsRead: (ids: number[]) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    addNotification: (n: Notification) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch recent notifications on mount to populate dropdown
    useEffect(() => {
        const fetchRecent = async () => {
            try {
                setLoading(true);
                // Fetch recent 20 notifications (mixed read/unread) for the dropdown
                const result = await NotificationService.getAllNotifications(1, 20);
                const recent = result.notifications;
                setNotifications(recent);
                
                // Fetch unread count. We can either do it by filtering recent if we assume all unread are in the top 20,
                // or just fetch unread to be absolutely accurate. For accuracy, let's just get unread.
                const unread = await NotificationService.getUnreadNotifications();
                
                // Calculate unread count based on last viewed timestamp
                const lastViewedStr = localStorage.getItem('lastViewedNotificationsAt');
                if (lastViewedStr) {
                    const lastViewedTime = new Date(lastViewedStr).getTime();
                    const newUnreadCount = unread.filter(n => new Date(n.created_at).getTime() > lastViewedTime).length;
                    setUnreadCount(newUnreadCount);
                } else {
                    setUnreadCount(unread.length);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    // Socket listeners
    useEffect(() => {
        socketService.connect();

        const handleNew = (n: Notification) => {
            setNotifications(prev => [n, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        const handleUpdated = (updated: Notification) => {
            setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
        };

        const handleDeleted = (data: { id: number }) => {
            setNotifications(prev => {
                const removed = prev.find(n => n.id === data.id);
                const newList = prev.filter(n => n.id !== data.id);
                if (removed && !removed.is_read) {
                    setUnreadCount(c => Math.max(0, c - 1));
                }
                return newList;
            });
        };

        const timer = setTimeout(() => {
            socketService.on('new_notification', handleNew as (...args: unknown[]) => void);
            socketService.on('notification_updated', handleUpdated as (...args: unknown[]) => void);
            socketService.on('notification_deleted', handleDeleted as (...args: unknown[]) => void);
        }, 500);

        return () => {
            clearTimeout(timer);
            socketService.off('new_notification', handleNew as (...args: unknown[]) => void);
            socketService.off('notification_updated', handleUpdated as (...args: unknown[]) => void);
            socketService.off('notification_deleted', handleDeleted as (...args: unknown[]) => void);
        };
    }, []);

    // Reset badge to 0 (frontend-only, called when dropdown opens)
    const resetBadge = useCallback(() => {
        setUnreadCount(0);
        localStorage.setItem('lastViewedNotificationsAt', new Date().toISOString());
    }, []);

    const markAsRead = useCallback(async (ids: number[]) => {
        await NotificationService.markAsRead(ids);
        setNotifications(prev =>
            prev.map(n => ids.includes(n.id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        );
    }, []);

    const markAllAsRead = useCallback(async () => {
        await NotificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);
    }, []);

    const deleteNotification = useCallback(async (id: number) => {
        await NotificationService.deleteNotification(id);
        setNotifications(prev => {
            const removed = prev.find(n => n.id === id);
            if (removed && !removed.is_read) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.filter(n => n.id !== id);
        });
    }, []);

    const addNotification = useCallback((n: Notification) => {
        setNotifications(prev => [n, ...prev]);
        if (!n.is_read) setUnreadCount(c => c + 1);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            resetBadge,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext(): NotificationContextValue {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
    return ctx;
}
