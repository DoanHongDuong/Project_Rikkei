import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Avatar, Typography, Badge, Tag, Button, message, Skeleton } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import TaskFormModal from './TaskFormModal';
import TaskDetailModal from './TaskDetailModal';
import TaskService from '../../services/taskService';
import RoadmapService from '../../services/roadmapService';
import dayjs from 'dayjs';

const { Text } = Typography;

interface Task {
  id: string | number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: string;
  assignee_id?: number | null;
  deadline?: string;
  roadmap_item_id?: number | null;
}

function SortableTaskItem({ task, onClick }: { task: Task, onClick: (task: Task) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id.toString(), data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '12px',
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(task)}>
      <Card size="small" style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>{task.title}</Text>
        {task.deadline && (
          <div style={{ marginBottom: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Deadline: {task.deadline}</Text>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tag color={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'processing' : 'default'}>
            {task.status.replace('_', ' ')}
          </Tag>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text style={{ fontSize: '12px' }}>{task.assignee || 'Unassigned'}</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Column({ title, status, tasks, onAddTask, onTaskClick }: { title: string, status: string, tasks: Task[], onAddTask: (status: string) => void, onTaskClick: (task: Task) => void }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: '16px',
        borderRadius: '8px',
        minHeight: '400px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Text strong>{title} <Badge count={tasks.length} style={{ backgroundColor: '#E5E7EB', color: '#374151' }} /></Text>
        <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => onAddTask(status)} />
      </div>

      <SortableContext items={tasks.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <SortableTaskItem key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ projectId, projectMembers, onTasksChanged }: { projectId?: string | number, projectMembers?: any[], onTasksChanged?: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const [detailTaskId, setDetailTaskId] = useState<string | number>('');
  const [currentStatusForNewTask, setCurrentStatusForNewTask] = useState('TODO');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await TaskService.getTasks(projectId);

      const tasksList = Array.isArray(data) ? data : data.tasks || [];
      const mappedTasks = tasksList.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        assignee_id: t.assignee_id,
        assignee: t.assignee?.full_name,
        deadline: t.deadline ? dayjs(t.deadline).format('YYYY-MM-DD') : undefined,
        roadmap_item_id: t.roadmap_item_id
      }));

      setTasks(mappedTasks);
    } catch (error: any) {
      message.error(error.message || 'Lỗi tải công việc');
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async () => {
    if (!projectId) return;
    try {
      const roadmap = await RoadmapService.getRoadmapByProject(projectId);
      if (roadmap) {
        const items = await RoadmapService.getRoadmapItems(roadmap.id);
        setMilestones(items || []);
      }
    } catch (error) {
      // Không có roadmap/milestone cũng không sao, dropdown milestone chỉ để trống.
    }
  };

  useEffect(() => {
    loadTasks();
    loadMilestones();
  }, [projectId]);

  const handleAddTask = (status: string) => {
    setEditingTask(null);
    setCurrentStatusForNewTask(status);
    setIsModalVisible(true);
  };

  const handleTaskClick = (task: Task) => {
    setDetailTaskId(task.id);
    setIsDetailModalVisible(true);
  };

  const handleEditTaskClick = () => {
    const taskToEdit = tasks.find(t => t.id === detailTaskId);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setIsDetailModalVisible(false);
      setIsModalVisible(true);
    }
  };

  const handleModalOk = async (values: any) => {
    if (!projectId) return;

    try {
      if (editingTask) {
        // Cập nhật task
        const payload = {
          title: values.title,
          description: values.description,
          due_date: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
          roadmap_item_id: values.roadmap_item_id ?? null
        };
        await TaskService.updateTask(editingTask.id, payload);
        if (values.assignee_id !== undefined) {
          await TaskService.assignTask(editingTask.id, values.assignee_id);
        }
        message.success('Cập nhật task thành công!');
      } else {
        // Thêm task mới
        const payload = {
          project_id: Number(projectId),
          title: values.title,
          description: values.description,
          status: values.status,
          assignee_id: values.assignee_id,
          due_date: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
          roadmap_item_id: values.roadmap_item_id ?? null
        };
        await TaskService.createTask(payload);
        message.success('Tạo task thành công!');
      }
      setIsModalVisible(false);
      setEditingTask(null);
      loadTasks(); // Refresh board
      onTasksChanged?.(); // Đồng bộ lại % progress ở project header
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const { data } = active;
    if (data.current?.type === 'Task') {
      setActiveTask(data.current.task);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Tìm cột đích
    let newStatus = '';
    if (isOverTask) {
      const overTask = tasks.find(t => t.id.toString() === overId.toString());
      newStatus = overTask?.status || '';
    } else if (isOverColumn) {
      newStatus = over.data.current?.status;
    }

    const activeTaskData = tasks.find(t => t.id.toString() === activeId.toString());

    if (newStatus && activeTaskData && activeTaskData.status !== newStatus) {
      // Optimistic update UI
      setTasks(prev => prev.map(t =>
        t.id.toString() === activeId.toString() ? { ...t, status: newStatus as any } : t
      ));

      try {
        await TaskService.updateTaskStatus(activeTaskData.id, newStatus);
        // Có thể loadTasks() lại để đảm bảo đồng bộ 
        onTasksChanged?.(); // Đồng bộ lại % progress ở project header
      } catch (error: any) {
        message.error(error.message || 'Lỗi cập nhật trạng thái');
        loadTasks(); // Revert back
      }
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
        <Column title="To Do" status="TODO" tasks={tasks.filter(t => t.status === 'TODO')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
        <Column title="In Progress" status="IN_PROGRESS" tasks={tasks.filter(t => t.status === 'IN_PROGRESS')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
        <Column title="Done" status="DONE" tasks={tasks.filter(t => t.status === 'DONE')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
      </div>

      <DragOverlay>
        {activeTask ? (
          <Card size="small" style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '100%' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>{activeTask.title}</Text>
            {activeTask.deadline && (
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>Deadline: {activeTask.deadline}</Text>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color={activeTask.status === 'DONE' ? 'success' : activeTask.status === 'IN_PROGRESS' ? 'processing' : 'default'}>
                {activeTask.status.replace('_', ' ')}
              </Tag>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text style={{ fontSize: '12px' }}>{activeTask.assignee || 'Unassigned'}</Text>
              </div>
            </div>
          </Card>
        ) : null}
      </DragOverlay>

      <TaskFormModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTask(null);
        }}
        onOk={handleModalOk}
        initialValues={editingTask ? { id: editingTask.id, title: editingTask.title, assignee_id: editingTask.assignee_id, status: editingTask.status, deadline: editingTask.deadline ? dayjs(editingTask.deadline) : undefined, roadmap_item_id: editingTask.roadmap_item_id } : { status: currentStatusForNewTask }}
        projectMembers={projectMembers}
        milestones={milestones}
      />

      <TaskDetailModal
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        taskId={detailTaskId}
        onEditClick={handleEditTaskClick}
      />
    </DndContext>
  );
}
