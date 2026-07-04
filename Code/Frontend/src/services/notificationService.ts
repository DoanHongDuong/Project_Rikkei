import axios from 'axios';
import AuthService from './authService';
import type { Notification, NotificationListResponse } from '../types/notification';

export type { Notification } from '../types/notification';

const API_BASE_URL = import.meta.env.BACKEND_URL;

const getAuthHeaders = () => ({
    Authorization: `Bearer ${AuthService.getToken()}`
});

const NotificationService = {
    getAllNotifications: async (page = 1, limit = 10): Promise<NotificationListResponse> => {
        const response = await axios.get<{ success: boolean; data: NotificationListResponse }>(
            `${API_BASE_URL}/api/notifications`,
            { headers: getAuthHeaders(), params: { page, limit } }
        );
        return response.data.data;
    },

    getUnreadNotifications: async (): Promise<Notification[]> => {
        const response = await axios.get<{ success: boolean; data: Notification[] }>(
            `${API_BASE_URL}/api/notifications/unread`,
            { headers: getAuthHeaders() }
        );
        return response.data.data;
    },

    markAsRead: async (notificationIds: number[]): Promise<void> => {
        await axios.put(
            `${API_BASE_URL}/api/notifications/mark-read`,
            { notificationIds },
            { headers: getAuthHeaders() }
        );
    },

    markAllAsRead: async (): Promise<void> => {
        await axios.put(
            `${API_BASE_URL}/api/notifications/mark-all-read`,
            {},
            { headers: getAuthHeaders() }
        );
    },

    deleteNotification: async (id: number): Promise<void> => {
        await axios.delete(
            `${API_BASE_URL}/api/notifications/${id}`,
            { headers: getAuthHeaders() }
        );
    }
};

export default NotificationService;
