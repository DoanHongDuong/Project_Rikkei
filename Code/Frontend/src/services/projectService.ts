import AuthService from './authService';
import type {
  Project,
  ProjectMember,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectListFilters,
  ProjectPagination,
  AddProjectMemberPayload,
  ApiResponse,
} from '../types/project';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ProjectListResult {
  projects: Project[];
  pagination: ProjectPagination;
}

class ProjectService {
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

  static async getProjects(filters: ProjectListFilters): Promise<ProjectListResult> {
    const params = new URLSearchParams();

    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));

    if (filters.search) {
      params.set('search', filters.search);
    }

    if (filters.status) {
      params.set('status', filters.status);
    }

    if (filters.manager_id) {
      params.set('manager_id', String(filters.manager_id));
    }

    const response = await fetch(`${API_BASE_URL}/api/projects?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<Project[]>(response);

    return {
      projects: result.data,
      pagination: result.pagination || {
        page: filters.page,
        limit: filters.limit,
        totalItems: result.data.length,
        totalPages: 1,
      },
    };
  }

  static async getProjectById(id: number): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<Project>(response);
    return result.data;
  }

  static async createProject(payload: CreateProjectPayload): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.parseResponse<Project>(response);
    return result.data;
  }

  static async updateProject(id: number, payload: UpdateProjectPayload): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.parseResponse<Project>(response);
    return result.data;
  }

  static async updateProjectStatus(id: number, status: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const result = await this.parseResponse<Project>(response);
    return result.data;
  }

  static async archiveProject(id: number): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<Project>(response);
    return result.data;
  }

  static async getProjectMembers(id: number): Promise<ProjectMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}/members`, {
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<ProjectMember[]>(response);
    return result.data;
  }

  static async addProjectMember(id: number, payload: AddProjectMemberPayload): Promise<ProjectMember> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}/members`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.parseResponse<ProjectMember>(response);
    return result.data;
  }

  static async removeProjectMember(id: number, userId: number): Promise<ProjectMember> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}/members/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const result = await this.parseResponse<ProjectMember>(response);
    return result.data;
  }
}

export default ProjectService;
