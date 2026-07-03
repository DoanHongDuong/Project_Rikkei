const API_BASE_URL = import.meta.env.BACKEND_URL;

class ProjectService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getProjects(params?: any) {
    const query = new URLSearchParams(params || {}).toString();
    const response = await fetch(`${API_BASE_URL}/api/projects?${query}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải danh sách dự án');
    }
    const data = await response.json();
    return data.data; 
  }

  static async createProject(projectData: any) {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tạo dự án');
    }
    const data = await response.json();
    return data.data;
  }

  static async getProjectDetail(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải chi tiết dự án');
    }
    const data = await response.json();
    return data.data;
  }

  static async getProjectMembers(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}/members`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải danh sách thành viên');
    }
    const data = await response.json();
    return data.data;
  }

  static async getProjectMemberDetail(projectId: number | string, memberId: number | string) {
    // Fetch members list then find the specific member
    const members = await this.getProjectMembers(projectId);
    const member = (members || []).find((m: any) => String(m.user_id) === String(memberId) || String(m.id) === String(memberId));
    return member || null;
  }

  static async addProjectMember(id: number | string, user_id: number | string, role: string = 'MEMBER') {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}/members`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ user_id, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi thêm thành viên');
    }
    const data = await response.json();
    return data.data;
  }

  static async removeProjectMember(id: number | string, userId: number | string) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}/members/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi xóa thành viên');
    }
    const data = await response.json();
    return data.data;
  }
}

export default ProjectService;
