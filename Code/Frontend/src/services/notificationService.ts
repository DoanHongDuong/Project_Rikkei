import axios from 'axios';
import AuthService from './authService';

const API_BASE_URL = import.meta.env.BACKEND_URL;

export interface Notification {
    id: number;
    type: string;
    title: string;
    content: string;
    payload: any;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

interface NotificationResponse {
    success: boolean;
    message: string;
    data: Notification[];
}

const NotificationService = {
    getUnreadNotifications: async (): Promise<Notification[]> => {
        try {
            const token = AuthService.getToken();
            const response = await axios.get<NotificationResponse>(`${API_BASE_URL}/api/notifications/unread`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            throw error;
        }
    },

    markAsRead: async (notificationIds: number[]): Promise<void> => {
        try {
            const token = AuthService.getToken();
            await axios.put(`${API_BASE_URL}/api/notifications/mark-read`, { notificationIds }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    }
};

export default NotificationService;
