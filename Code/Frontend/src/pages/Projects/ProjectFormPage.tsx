import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectService from '../../services/projectService';
import type { CreateProjectPayload, UpdateProjectPayload, ProjectStatus } from '../../types/project';
import './Projects.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  manager_id: '',
  status: 'ACTIVE' as ProjectStatus,
};

interface ProjectFormState {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  manager_id: string;
  status: ProjectStatus;
}

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadProject(Number(id));
    }
  }, [isEdit, id]);

  const loadProject = async (projectId: number) => {
    setLoadingProject(true);
    setError('');

    try {
      const project = await ProjectService.getProjectById(projectId);
      setForm({
        name: project.name,
        description: project.description || '',
        start_date: project.start_date,
        end_date: project.end_date,
        manager_id: project.manager_id ? String(project.manager_id) : '',
        status: project.status,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin project.');
    } finally {
      setLoadingProject(false);
    }
  };

  const updateForm = (name: keyof ProjectFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildCreatePayload = (): CreateProjectPayload => ({
    name: form.name,
    description: form.description || undefined,
    start_date: form.start_date,
    end_date: form.end_date,
    manager_id: form.manager_id ? Number(form.manager_id) : undefined,
  });

  const buildUpdatePayload = (): UpdateProjectPayload => ({
    name: form.name,
    description: form.description || undefined,
    start_date: form.start_date,
    end_date: form.end_date,
    manager_id: form.manager_id ? Number(form.manager_id) : undefined,
    status: form.status,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit && id) {
        await ProjectService.updateProject(Number(id), buildUpdatePayload());
      } else {
        await ProjectService.createProject(buildCreatePayload());
      }

      navigate('/projects');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  if (loadingProject) {
    return <div className="projects-page">Đang tải...</div>;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h2>{isEdit ? 'Cập nhật dự án' : 'Tạo dự án mới'}</h2>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="form-container">
        <form className="project-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-group">
            <label htmlFor="name">
              Tên dự án <span className="required">*</span>
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Nhập tên dự án"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Nhập mô tả dự án"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">
                Ngày bắt đầu <span className="required">*</span>
              </label>
              <input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => updateForm('start_date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_date">
                Ngày kết thúc <span className="required">*</span>
              </label>
              <input
                id="end_date"
                type="date"
                value={form.end_date}
                onChange={(e) => updateForm('end_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manager_id">Manager ID</label>
              <input
                id="manager_id"
                type="number"
                value={form.manager_id}
                onChange={(e) => updateForm('manager_id', e.target.value)}
                placeholder="Nhập ID manager"
                min="1"
              />
            </div>

            {isEdit && (
              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" value={form.status} onChange={(e) => updateForm('status', e.target.value)}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo dự án'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel} disabled={loading}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
