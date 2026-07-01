const API_BASE_URL = 'http://localhost:5000';

class RoadmapService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get roadmap by project ID
  static async getRoadmapByProject(projectId: number | string) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/roadmaps`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 404) return null; // Roadmap not found
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải roadmap');
    }
    const data = await response.json();
    return data.data; // { success: true, data: { id, project_id, title... } }
  }

  // Create a new roadmap for a project
  static async createRoadmap(projectId: number | string, title?: string) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/roadmaps`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tạo roadmap');
    }
    const data = await response.json();
    return data.data;
  }

  // Get items (milestones) for a roadmap
  static async getRoadmapItems(roadmapId: number | string) {
    const response = await fetch(`${API_BASE_URL}/api/roadmaps/${roadmapId}/items`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải milestones');
    }
    const data = await response.json();
    return data.data;
  }

  // Create a roadmap item (milestone)
  static async createRoadmapItem(roadmapId: number | string, itemData: any) {
    const response = await fetch(`${API_BASE_URL}/api/roadmaps/${roadmapId}/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tạo milestone');
    }
    const data = await response.json();
    return data.data;
  }

  // Update a roadmap item
  static async updateRoadmapItem(itemId: number | string, itemData: any) {
    const response = await fetch(`${API_BASE_URL}/api/roadmap-items/${itemId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi cập nhật milestone');
    }
    const data = await response.json();
    return data.data;
  }

  // Delete a roadmap item
  static async deleteRoadmapItem(itemId: number | string) {
    const response = await fetch(`${API_BASE_URL}/api/roadmap-items/${itemId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi xóa milestone');
    }
    return true;
  }
}

export default RoadmapService;
