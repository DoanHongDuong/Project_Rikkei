export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  manager_id: number | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  manager?: {
    id: number;
    full_name: string;
    email: string;
  };
  creator?: {
    id: number;
    full_name: string;
    email: string;
  };
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  manager_id?: number;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  manager_id?: number;
}

export interface ProjectListFilters {
  page: number;
  limit: number;
  search?: string;
  status?: ProjectStatus | '';
  manager_id?: number | '';
}

export interface ProjectPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface AddProjectMemberPayload {
  user_id: number;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: ProjectPagination;
}
