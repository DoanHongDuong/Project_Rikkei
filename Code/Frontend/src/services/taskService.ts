import AuthService from './authService';
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskListFilters,
  TaskPagination,
  ApiResponse,
} from '../types/task';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface TaskListResult {
  tasks: Task[];
  pagination: TaskPagination;
}

class TaskService {
  private static getAuthHeaders(): HeadersInit {
    const token = AuthService.getToken();

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private static async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const result = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new Error(result.message || 'Request thất bại.');
    }

    return result;
  }

  static async getTasks(filters: TaskListFilters): Promise<TaskListResult> {
    const params = new URLSearchParams();

    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));

    if (filters.project_id) {
      params.set('project_id', String(filters.project_id));
    }

    if (filters.status) {
      params.set('status', filters.status);
    }

    if (filters.priority) {
      params.set('priority', filters.priority);
    }

    if (filters.assignee_id) {
      params.set('assignee_id', String(filters.assignee_id));
    }

    if (filters.search) {
      params.set('search', filters.search);
    }

    const response = await fetch(`${API_BASE_URL}/api/tasks?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<Task[]>(response);

    return {
      tasks: result.data,
      pagination: result.pagination || {
        page: filters.page,
        limit: filters.limit,
        totalItems: result.data.length,
        totalPages: 1,
      },
    };
  }

  static async getTaskById(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<Task>(response);
    return result.data;
  }

  static async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.parseResponse<Task>(response);
    return result.data;
  }

  static async updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.parseResponse<Task>(response);
    return result.data;
  }

  static async updateTaskStatus(id: number, status: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const result = await this.parseResponse<Task>(response);
    return result.data;
  }

  static async assignTask(id: number, assignee_id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/assign`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ assignee_id }),
    });

    const result = await this.parseResponse<Task>(response);
    return result.data;
  }

  static async softDeleteTask(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<Task>(response);
    return result.data;
  }
}

export default TaskService;
