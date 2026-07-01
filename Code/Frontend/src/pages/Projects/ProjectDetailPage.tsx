import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectService from '../../services/projectService';
import TaskService from '../../services/taskService';
import AdminUserService from '../../services/adminUserService';
import type { Project, ProjectMember, AddProjectMemberPayload } from '../../types/project';
import type { Task } from '../../types/task';
import type { AdminUser } from '../../types/user-management';
import './Projects.css';

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectData(Number(id));
    }
  }, [id]);

  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const result = await AdminUserService.getUsers({ page: 1, limit: 100, status: 'ACTIVE' });
      setAvailableUsers(result.users);
    } catch (err: unknown) {
      console.error('Không thể tải danh sách users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showAddMember) {
      void loadAvailableUsers();
    }
  }, [showAddMember]);

  const loadProjectData = async (projectId: number) => {
    setLoading(true);
    setError('');

    try {
      const [projectData, membersData, tasksData] = await Promise.all([
        ProjectService.getProjectById(projectId),
        ProjectService.getProjectMembers(projectId),
        TaskService.getTasks({ page: 1, limit: 10, project_id: projectId }),
      ]);

      setProject(projectData);
      setMembers(membersData);
      setTasks(tasksData.tasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin project.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !newMemberUserId) return;

    setLoading(true);
    setError('');

    try {
      const payload: AddProjectMemberPayload = {
        user_id: Number(newMemberUserId),
      };

      await ProjectService.addProjectMember(Number(id), payload);
      setNewMemberUserId('');
      setShowAddMember(false);
      await loadProjectData(Number(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể thêm thành viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa thành viên này khỏi project?')) return;

    setLoading(true);
    setError('');

    try {
      await ProjectService.removeProjectMember(Number(id), userId);
      await loadProjectData(Number(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể xóa thành viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'TODO':
        return 'green';
      case 'ON_HOLD':
      case 'BLOCKED':
        return 'orange';
      case 'COMPLETED':
      case 'DONE':
        return 'blue';
      case 'ARCHIVED':
      case 'CANCELED':
        return 'gray';
      case 'IN_PROGRESS':
      case 'REVIEW':
        return 'blue';
      default:
        return 'default';
    }
  };

  if (loading && !project) {
    return <div className="projects-page">Đang tải...</div>;
  }

  if (!project) {
    return <div className="projects-page">Không tìm thấy project.</div>;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h2>{project.name}</h2>
        <div className="header-actions">
          <button type="button" onClick={handleEdit} className="btn-secondary">
            Sửa dự án
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="project-detail-grid">
        <div className="detail-card">
          <h3>Thông tin dự án</h3>
          <div className="detail-info">
            <div className="info-row">
              <span className="info-label">Mô tả:</span>
              <span className="info-value">{project.description || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Trạng thái:</span>
              <span className={`status-badge status-${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Ngày bắt đầu:</span>
              <span className="info-value">{project.start_date}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ngày kết thúc:</span>
              <span className="info-value">{project.end_date}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Manager:</span>
              <span className="info-value">{project.manager?.full_name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Người tạo:</span>
              <span className="info-value">{project.creator?.full_name || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <h3>Thành viên ({members.length})</h3>
            <button
              type="button"
              onClick={() => setShowAddMember(!showAddMember)}
              className="btn-primary"
              disabled={loading}
            >
              + Thêm thành viên
            </button>
          </div>

          {showAddMember && (
            <form className="add-member-form" onSubmit={(event) => void handleAddMember(event)}>
              <select
                value={newMemberUserId}
                onChange={(e) => setNewMemberUserId(e.target.value)}
                required
                disabled={loadingUsers}
              >
                <option value="">Chọn thành viên...</option>
                {availableUsers
                  .filter((user) => !members.some((member) => member.user_id === user.id))
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email}) - {user.role}
                    </option>
                  ))}
              </select>
              <button type="submit" disabled={loading || loadingUsers}>
                Thêm
              </button>
              <button type="button" onClick={() => setShowAddMember(false)} disabled={loading}>
                Hủy
              </button>
            </form>
          )}

          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <div className="member-name">{member.user?.full_name}</div>
                  <div className="member-email">{member.user?.email}</div>
                  <div className="member-role">{member.role}</div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemoveMember(member.user_id)}
                  className="btn-danger"
                  disabled={loading}
                >
                  Xóa
                </button>
              </div>
            ))}
            {!members.length && <p className="empty-state">Chưa có thành viên nào.</p>}
          </div>
        </div>
      </div>

      <div className="detail-card tasks-section">
        <div className="card-header">
          <h3>Công việc ({tasks.length})</h3>
          <button
            type="button"
            onClick={() => navigate(`/tasks/create?project_id=${id}`)}
            className="btn-primary"
          >
            + Tạo task mới
          </button>
        </div>

        <table className="projects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Trạng thái</th>
              <th>Ưu tiên</th>
              <th>Assignee</th>
              <th>Deadline</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.title}</td>
                <td>
                  <span className={`status-badge status-${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td>{task.priority}</td>
                <td>{task.assignee?.full_name || 'N/A'}</td>
                <td>{task.deadline}</td>
                <td>
                  <button type="button" onClick={() => handleViewTask(task.id)} disabled={loading}>
                    Xem
                  </button>
                </td>
              </tr>
            ))}
            {!tasks.length && (
              <tr>
                <td colSpan={7}>Chưa có công việc nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
