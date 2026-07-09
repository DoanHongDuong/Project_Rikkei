import axios from 'axios';
import AuthService from './authService';

const API_BASE_URL = import.meta.env.BACKEND_URL;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TaskOverview {
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface TaskByStatus {
  status: string;
  count: number;
}

export interface TaskByPriority {
  priority: string;
  count: number;
}

export interface TaskByProject {
  projectName: string;
  total: number;
  done: number;
}

export interface ProjectReportItem {
  id: number;
  name: string;
  status: string;
  managerName: string | null;
  totalTasks: number;
  doneTasks: number;
  progress: number;
  endDate: string | null;
}

export interface UserPerformanceItem {
  id: number;
  fullName: string;
  department: string | null;
  totalAssigned: number;
  done: number;
  overdue: number;
  completionRate: number;
}

export interface DepartmentSummaryItem {
  id: number;
  name: string;
  userCount: number;
  activeTasks: number;
  completionRate: number;
}

export interface ActivityTimelineItem {
  id: number;
  action_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  updatedBy: { id: number; full_name: string; role: string } | null;
  task: { 
    id: number; 
    title: string;
    project: { id: number; name: string } | null;
  } | null;
}

export interface ProjectStatusDistributionItem {
  status: string;
  count: number;
}

export interface TaskTrendItem {
  date: string;
  created: number;
  completed: number;
}

export interface AdminReportData {
  taskOverview: TaskOverview;
  taskByStatus: TaskByStatus[];
  taskByPriority: TaskByPriority[];
  taskByProject: TaskByProject[];
  projectReport: ProjectReportItem[];
  userPerformance: UserPerformanceItem[];
  departmentSummary: DepartmentSummaryItem[];
  activityTimeline: ActivityTimelineItem[];
  projectStatusDistribution: ProjectStatusDistributionItem[];
  taskTrend: TaskTrendItem[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

class ReportService {
  static async getAdminReport(): Promise<{ success: boolean; data: AdminReportData; message: string }> {
    try {
      const token = AuthService.getToken();
      const response = await axios.get(`${API_BASE_URL}/api/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || 'Lỗi khi tải dữ liệu báo cáo');
      }
      throw new Error('Lỗi mạng hoặc server không phản hồi');
    }
  }
}

export default ReportService;
