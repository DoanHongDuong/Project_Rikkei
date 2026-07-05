import type { Notification, NotificationPayload } from '../types/notification';

// Các type liên quan tới yêu cầu gia hạn deadline — cần điều hướng về đúng task
// VÀ tự mở khung "extension-request-section" trong TaskDetailModal (highlightExtension).
const EXTENSION_TYPES = [
    'DEADLINE_EXTENSION_REQUESTED',
    'DEADLINE_EXTENSION_APPROVED',
    'DEADLINE_EXTENSION_REJECTED',
];

// Parse payload an toàn + chuẩn hóa về camelCase, phòng khi có bản ghi cũ
// còn lưu snake_case (task_id/project_id) từ trước khi extensionService.js được sửa.
export const parseNotificationPayload = (n: Notification): NotificationPayload | null => {
    if (!n.payload) return null;
    const raw = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload;
    return {
        ...raw,
        taskId: raw.taskId ?? raw.task_id,
        projectId: raw.projectId ?? raw.project_id,
        commentId: raw.commentId ?? raw.comment_id,
    };
};

// Hàm dùng chung cho cả NotificationDropdown.tsx và pages/Notifications/index.tsx
// — trước đây bị copy-paste 2 nơi nên sửa 1 chỗ dễ quên chỗ còn lại.
export const getNavigationPath = (n: Notification): string | null => {
    const p = parseNotificationPayload(n);
    if (!p) return null;

    if (n.type === 'ROADMAP_ITEM_UPDATED' && p.projectId) {
        return `/projects/${p.projectId}?tab=4`;
    }

    if (EXTENSION_TYPES.includes(n.type) && p.taskId && p.projectId) {
        return `/projects/${p.projectId}?tab=2&highlightTask=${p.taskId}&highlightExtension=true`;
    }

    if (p.taskId && p.projectId) {
        if (p.commentId) {
            return `/projects/${p.projectId}?tab=2&highlightTask=${p.taskId}&highlightComment=${p.commentId}`;
        }
        return `/projects/${p.projectId}?tab=2&highlightTask=${p.taskId}`;
    }

    if (p.projectId) {
        return `/projects/${p.projectId}`;
    }

    return null;
};

export const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};