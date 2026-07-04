export type NotificationType =
    | 'TASK_ASSIGNED'
    | 'TASK_COMMENT'
    | 'TASK_UPDATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_ARCHIVED'
    | 'MEMBER_ADDED'
    | 'MEMBER_REMOVED'
    | 'ROADMAP_ITEM_UPDATED'
    | 'EXTENSION_APPROVED'
    | 'EXTENSION_REJECTED'
    | 'COMMENT_REPLY';

export interface NotificationPayload {
    taskId?: number | string;
    projectId?: number | string;
    projectName?: string;
    assignerName?: string;
    commenterName?: string;
    taskTitle?: string;
    updatedBy?: string;
    addedBy?: string;
    removedBy?: string;
    archivedBy?: string;
    changedBy?: string;
    roadmapItemTitle?: string;
    role?: string;
    priority?: string;
    status?: string;
    deadline?: string;
}

export interface Notification {
    id: number;
    user_id?: number;
    type: NotificationType;
    title: string;
    content: string;
    payload: NotificationPayload | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export interface NotificationPagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

export interface NotificationListResponse {
    notifications: Notification[];
    pagination: NotificationPagination;
}
