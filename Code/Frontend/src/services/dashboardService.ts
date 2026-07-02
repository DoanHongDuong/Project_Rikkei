const API_BASE_URL = 'http://localhost:5000';

interface DashboardStatistics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  lateTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  blockedTasks: number;
  reviewTasks: number;
}

interface Activity {
  id: number;
  title: string;
  status: string;
  project: string;
  assignee: string;
  updated_at: string;
}

class DashboardService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getStatistics(): Promise<DashboardStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/statistics`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi lấy thống kê dashboard');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  static async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/activities?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi khi lấy hoạt động gần đây');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error;
    }
  }
}

export default DashboardService;
