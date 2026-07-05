export type NotificationType =
    | 'TASK_ASSIGNED'
    | 'TASK_COMMENT'
    | 'TASK_UPDATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_ARCHIVED'
    | 'MEMBER_ADDED'
    | 'MEMBER_REMOVED'
    | 'ROADMAP_ITEM_UPDATED'
    | 'COMMENT_REPLY'
    | 'DEADLINE_EXTENSION_REQUESTED'
    | 'DEADLINE_EXTENSION_APPROVED'
    | 'DEADLINE_EXTENSION_REJECTED';

export interface NotificationPayload {
    // camelCase (legacy)
    taskId?: number | string;
    projectId?: number | string;
    commentId?: number | string;
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
    // snake_case (from backend extension service)
    task_id?: number | string;
    project_id?: number | string;
    comment_id?: number | string;
    request_id?: number | string;
}

export interface Notification {
    id: number;
    user_id?: number;
    type: NotificationType;
    title: string;
    content: string;
    payload: NotificationPayload | string | null;
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
