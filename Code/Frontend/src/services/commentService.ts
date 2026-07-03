const API_BASE_URL = 'http://localhost:5000';

class CommentService {
  private static getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getCommentsByTask(taskId: string | number) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tải bình luận');
    }
    const data = await response.json();
    return data.data;
  }

  static async createComment(taskId: string | number, content: string, parentCommentId?: string | number) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content, parent_comment_id: parentCommentId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tạo bình luận');
    }
    const data = await response.json();
    return data.data;
  }

  static async deleteComment(commentId: string | number) {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi xóa bình luận');
    }
    const data = await response.json();
    return data.data;
  }
}

export default CommentService;
