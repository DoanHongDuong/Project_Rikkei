export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'BLOCKED' | 'DONE' | 'CANCELED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: number;
  project_id: number;
  roadmap_item_id: number | null;
  parent_task_id: number | null;
  assignee_id: number | null;
  created_by: number;
  updated_by: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  deadline: string;
  completed_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: number;
    name: string;
  };
  assignee?: {
    id: number;
    full_name: string;
    email: string;
  };
  creator?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface CreateTaskPayload {
  project_id: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  deadline: string;
  assignee_id?: number;
  parent_task_id?: number;
  roadmap_item_id?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  deadline?: string;
  assignee_id?: number;
  parent_task_id?: number;
  roadmap_item_id?: number;
}

export interface TaskListFilters {
  page: number;
  limit: number;
  project_id?: number;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  assignee_id?: number | '';
  search?: string;
}

export interface TaskPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: TaskPagination;
}
