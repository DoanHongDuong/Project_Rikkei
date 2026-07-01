import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectService from '../../services/projectService';
import type {
  Project,
  ProjectListFilters,
  ProjectPagination,
  ProjectStatus,
} from '../../types/project';
import './Projects.css';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export default function ProjectListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<ProjectPagination>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<ProjectListFilters>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    search: '',
    status: '',
    manager_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProjects = async (nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const result = await ProjectService.getProjects(nextFilters);
      setProjects(result.projects);
      setPagination(result.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const updateFilter = (name: keyof ProjectListFilters, value: string) => {
    const nextFilters = {
      ...filters,
      page: DEFAULT_PAGE,
      [name]: value,
    };

    setFilters(nextFilters);
  };

  const handleApplyFilters = async () => {
    await loadProjects(filters);
  };

  const handleChangePage = async (page: number) => {
    const nextFilters = {
      ...filters,
      page,
    };

    setFilters(nextFilters);
    await loadProjects(nextFilters);
  };

  const handleViewDetail = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleCreate = () => {
    navigate('/projects/create');
  };

  const handleEdit = (id: number) => {
    navigate(`/projects/${id}/edit`);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'ON_HOLD':
        return 'orange';
      case 'COMPLETED':
        return 'blue';
      case 'ARCHIVED':
        return 'gray';
      default:
        return 'default';
    }
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h2>Dự án</h2>
        <button type="button" onClick={handleCreate} className="btn-primary">
          + Tạo dự án mới
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="projects-filters">
        <input
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Tìm kiếm theo tên..."
        />
        <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="ON_HOLD">ON_HOLD</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <button type="button" onClick={() => void handleApplyFilters()} disabled={loading}>
          Lọc
        </button>
      </div>

      <div className="projects-table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên dự án</th>
              <th>Trạng thái</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Manager</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>
                  <span className={`status-badge status-${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td>{project.start_date}</td>
                <td>{project.end_date}</td>
                <td>{project.manager?.full_name || 'N/A'}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => handleViewDetail(project.id)} disabled={loading}>
                      Xem
                    </button>
                    <button type="button" onClick={() => handleEdit(project.id)} disabled={loading}>
                      Sửa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!projects.length && !loading && (
              <tr>
                <td colSpan={7}>Không có dự án nào.</td>
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
