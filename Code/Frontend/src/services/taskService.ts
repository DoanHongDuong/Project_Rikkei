const API_BASE_URL = import.meta.env.BACKEND_URL;

class TaskService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getTasks(filters?: any) {
    let url = `${API_BASE_URL}/api/tasks?limit=100`;
    if (filters) {
      if (typeof filters === 'string' || typeof filters === 'number') {
        url += `&project_id=${filters}`;
      } else {
        if (filters.project_id) url += `&project_id=${filters.project_id}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.assignee_id) url += `&assignee_id=${filters.assignee_id}`;
      }
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải danh sách công việc');
    }
    const data = await response.json();
    return data.data; 
  }

  static async getTaskDetail(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải chi tiết công việc');
    }
    const data = await response.json();
    return data.data;
  }

  static async createTask(taskData: any) {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tạo công việc');
    }
    const data = await response.json();
    return data.data;
  }

  static async updateTask(id: string | number, taskData: any) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi cập nhật công việc');
    }
    const data = await response.json();
    return data.data;
  }

  static async updateTaskStatus(id: string | number, status: string) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi cập nhật trạng thái');
    }
    const data = await response.json();
    return data.data;
  }

  static async assignTask(id: string | number, assignee_id: number | null) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/assign`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ assignee_id }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi phân công công việc');
    }
    const data = await response.json();
    return data.data;
  }

  static async deleteTask(id: string | number) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi xóa công việc');
    }
    const data = await response.json();
    return data.data;
  }
}

export default TaskService;
