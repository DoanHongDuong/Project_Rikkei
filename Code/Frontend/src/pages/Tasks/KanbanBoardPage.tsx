import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TaskService from '../../services/taskService';
import type { Task, TaskStatus } from '../../types/task';
import './Tasks.css';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'gray' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { status: 'REVIEW', label: 'Review', color: 'purple' },
  { status: 'BLOCKED', label: 'Blocked', color: 'red' },
  { status: 'DONE', label: 'Done', color: 'green' },
];

export default function KanbanBoardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('project_id');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const filters: any = {
        page: 1,
        limit: 100,
      };

      if (projectIdParam) {
        filters.project_id = Number(projectIdParam);
      }

      const result = await TaskService.getTasks(filters);
      setTasks(result.tasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách task.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, [projectIdParam]);

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    try {
      await TaskService.updateTaskStatus(draggedTask.id, status);
      await loadTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái task.');
    } finally {
      setDraggedTask(null);
    }
  };

  const handleViewTask = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'priority-gray';
      case 'MEDIUM':
        return 'priority-blue';
      case 'HIGH':
        return 'priority-orange';
      case 'URGENT':
        return 'priority-red';
      default:
        return 'priority-gray';
    }
  };

  const isOverdue = (deadline: string): boolean => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return <div className="kanban-page">Đang tải...</div>;
  }

  return (
    <div className="kanban-page">
      <div className="kanban-header">
        <h2>Kanban Board</h2>
        {projectIdParam && (
          <button type="button" onClick={() => navigate(`/projects/${projectIdParam}`)} className="btn-secondary">
            ← Quay lại Project
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="kanban-board">
        {COLUMNS.map((column) => (
          <div
            key={column.status}
            className={`kanban-column kanban-column-${column.color}`}
            onDragOver={handleDragOver}
            onDrop={() => void handleDrop(column.status)}
          >
            <div className="kanban-column-header">
              <h3>{column.label}</h3>
              <span className="task-count">{getTasksByStatus(column.status).length}</span>
            </div>

            <div className="kanban-tasks">
              {getTasksByStatus(column.status).map((task) => (
                <div
                  key={task.id}
                  className={`kanban-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                >
                  <div className="kanban-card-header">
                    <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {isOverdue(task.deadline) && task.status !== 'DONE' && (
                      <span className="overdue-badge">Overdue</span>
                    )}
                  </div>

                  <h4 className="kanban-card-title">{task.title}</h4>

                  {task.description && (
                    <p className="kanban-card-description">{task.description.substring(0, 100)}...</p>
                  )}

                  <div className="kanban-card-footer">
                    <div className="kanban-assignee">
                      {task.assignee ? (
                        <span>{task.assignee.full_name}</span>
                      ) : (
                        <span className="unassigned">Unassigned</span>
                      )}
                    </div>
                    <div className="kanban-deadline">
                      <span>{task.deadline}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="kanban-view-btn"
                    onClick={() => handleViewTask(task.id)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}

              {getTasksByStatus(column.status).length === 0 && (
                <div className="kanban-empty">Không có task</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
