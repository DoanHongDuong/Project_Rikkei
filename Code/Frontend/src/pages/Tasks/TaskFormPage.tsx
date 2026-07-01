import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TaskService from '../../services/taskService';
import type { CreateTaskPayload, UpdateTaskPayload, TaskStatus, TaskPriority } from '../../types/task';
import './Tasks.css';

const EMPTY_FORM = {
  project_id: '',
  title: '',
  description: '',
  status: 'TODO' as TaskStatus,
  priority: 'MEDIUM' as TaskPriority,
  start_date: '',
  deadline: '',
  assignee_id: '',
  parent_task_id: '',
  roadmap_item_id: '',
};

interface TaskFormState {
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string;
  deadline: string;
  assignee_id: string;
  parent_task_id: string;
  roadmap_item_id: string;
}

export default function TaskFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const projectIdParam = searchParams.get('project_id');

  const [form, setForm] = useState<TaskFormState>({
    ...EMPTY_FORM,
    project_id: projectIdParam || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingTask, setLoadingTask] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadTask(Number(id));
    }
  }, [isEdit, id]);

  const loadTask = async (taskId: number) => {
    setLoadingTask(true);
    setError('');

    try {
      const task = await TaskService.getTaskById(taskId);
      setForm({
        project_id: String(task.project_id),
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        start_date: task.start_date || '',
        deadline: task.deadline,
        assignee_id: task.assignee_id ? String(task.assignee_id) : '',
        parent_task_id: task.parent_task_id ? String(task.parent_task_id) : '',
        roadmap_item_id: task.roadmap_item_id ? String(task.roadmap_item_id) : '',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin task.');
    } finally {
      setLoadingTask(false);
    }
  };

  const updateForm = (name: keyof TaskFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildCreatePayload = (): CreateTaskPayload => ({
    project_id: Number(form.project_id),
    title: form.title,
    description: form.description || undefined,
    status: form.status,
    priority: form.priority,
    start_date: form.start_date || undefined,
    deadline: form.deadline,
    assignee_id: form.assignee_id ? Number(form.assignee_id) : undefined,
    parent_task_id: form.parent_task_id ? Number(form.parent_task_id) : undefined,
    roadmap_item_id: form.roadmap_item_id ? Number(form.roadmap_item_id) : undefined,
  });

  const buildUpdatePayload = (): UpdateTaskPayload => ({
    title: form.title,
    description: form.description || undefined,
    status: form.status,
    priority: form.priority,
    start_date: form.start_date || undefined,
    deadline: form.deadline,
    assignee_id: form.assignee_id ? Number(form.assignee_id) : undefined,
    parent_task_id: form.parent_task_id ? Number(form.parent_task_id) : undefined,
    roadmap_item_id: form.roadmap_item_id ? Number(form.roadmap_item_id) : undefined,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit && id) {
        await TaskService.updateTask(Number(id), buildUpdatePayload());
      } else {
        await TaskService.createTask(buildCreatePayload());
      }

      navigate('/tasks');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  if (loadingTask) {
    return <div className="tasks-page">Đang tải...</div>;
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h2>{isEdit ? 'Cập nhật công việc' : 'Tạo công việc mới'}</h2>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="form-container">
        <form className="task-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-group">
            <label htmlFor="project_id">
              Project ID <span className="required">*</span>
            </label>
            <input
              id="project_id"
              type="number"
              value={form.project_id}
              onChange={(e) => updateForm('project_id', e.target.value)}
              placeholder="Nhập ID project"
              required
              min="1"
              disabled={isEdit}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Tiêu đề <span className="required">*</span>
            </label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="Nhập tiêu đề task"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Nhập mô tả task"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select id="status" value={form.status} onChange={(e) => updateForm('status', e.target.value)}>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="REVIEW">REVIEW</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="DONE">DONE</option>
                <option value="CANCELED">CANCELED</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Ưu tiên</label>
              <select id="priority" value={form.priority} onChange={(e) => updateForm('priority', e.target.value)}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Ngày bắt đầu</label>
              <input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => updateForm('start_date', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">
                Deadline <span className="required">*</span>
              </label>
              <input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => updateForm('deadline', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignee_id">Assignee ID</label>
              <input
                id="assignee_id"
                type="number"
                value={form.assignee_id}
                onChange={(e) => updateForm('assignee_id', e.target.value)}
                placeholder="Nhập ID assignee"
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="parent_task_id">Parent Task ID</label>
              <input
                id="parent_task_id"
                type="number"
                value={form.parent_task_id}
                onChange={(e) => updateForm('parent_task_id', e.target.value)}
                placeholder="Nhập ID task cha"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="roadmap_item_id">Roadmap Item ID</label>
            <input
              id="roadmap_item_id"
              type="number"
              value={form.roadmap_item_id}
              onChange={(e) => updateForm('roadmap_item_id', e.target.value)}
              placeholder="Nhập ID roadmap item"
              min="1"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo task'}
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
