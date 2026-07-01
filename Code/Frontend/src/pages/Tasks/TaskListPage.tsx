import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TaskService from '../../services/taskService';
import type { Task, TaskListFilters, TaskPagination, TaskStatus, TaskPriority } from '../../types/task';
import './Tasks.css';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export default function TaskListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('project_id');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<TaskPagination>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<TaskListFilters>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    project_id: projectIdParam ? Number(projectIdParam) : undefined,
    status: '',
    priority: '',
    assignee_id: '',
    search: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTasks = async (nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const result = await TaskService.getTasks(nextFilters);
      setTasks(result.tasks);
      setPagination(result.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách task.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const updateFilter = (name: keyof TaskListFilters, value: string | number | undefined) => {
    const nextFilters = {
      ...filters,
      page: DEFAULT_PAGE,
      [name]: value,
    };

    setFilters(nextFilters);
  };

  const handleApplyFilters = async () => {
    await loadTasks(filters);
  };

  const handleChangePage = async (page: number) => {
    const nextFilters = {
      ...filters,
      page,
    };

    setFilters(nextFilters);
    await loadTasks(nextFilters);
  };

  const handleViewDetail = (id: number) => {
    navigate(`/tasks/${id}`);
  };

  const handleCreate = () => {
    const params = new URLSearchParams();
    if (filters.project_id) {
      params.set('project_id', String(filters.project_id));
    }
    navigate(`/tasks/create?${params.toString()}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/tasks/${id}/edit`);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'gray';
      case 'IN_PROGRESS':
        return 'blue';
      case 'REVIEW':
        return 'purple';
      case 'BLOCKED':
        return 'red';
      case 'DONE':
        return 'green';
      case 'CANCELED':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'LOW':
        return 'gray';
      case 'MEDIUM':
        return 'blue';
      case 'HIGH':
        return 'orange';
      case 'URGENT':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h2>Công việc</h2>
        <button type="button" onClick={handleCreate} className="btn-primary">
          + Tạo task mới
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="tasks-filters">
        <input
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề..."
        />
        <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="REVIEW">REVIEW</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="DONE">DONE</option>
          <option value="CANCELED">CANCELED</option>
        </select>
        <select value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}>
          <option value="">Tất cả ưu tiên</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
        <input
          value={filters.assignee_id || ''}
          onChange={(e) => updateFilter('assignee_id', e.target.value ? Number(e.target.value) : '')}
          placeholder="Assignee ID"
          type="number"
          min="1"
        />
        <button type="button" onClick={() => void handleApplyFilters()} disabled={loading}>
          Lọc
        </button>
      </div>

      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Dự án</th>
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
                <td>{task.project?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge priority-${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td>{task.assignee?.full_name || 'N/A'}</td>
                <td>{task.deadline}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => handleViewDetail(task.id)} disabled={loading}>
                      Xem
                    </button>
                    <button type="button" onClick={() => handleEdit(task.id)} disabled={loading}>
                      Sửa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!tasks.length && !loading && (
              <tr>
                <td colSpan={8}>Không có task nào.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button
            type="button"
            disabled={loading || pagination.page <= DEFAULT_PAGE}
            onClick={() => void handleChangePage(pagination.page - 1)}
          >
            Trang trước
          </button>
          <span>
            Trang {pagination.page} / {pagination.totalPages || DEFAULT_PAGE} · Tổng {pagination.totalItems}
          </span>
          <button
            type="button"
            disabled={loading || pagination.page >= pagination.totalPages}
            onClick={() => void handleChangePage(pagination.page + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
