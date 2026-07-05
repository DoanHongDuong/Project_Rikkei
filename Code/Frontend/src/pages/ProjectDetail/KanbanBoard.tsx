import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  pointerWithin,
  closestCorners
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Avatar, Typography, Badge, Tag, Button, message, Skeleton, Select } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import TaskFormModal from './TaskFormModal';
import TaskDetailModal from './TaskDetailModal';
import TaskService from '../../services/taskService';
import RoadmapService from '../../services/roadmapService';
import dayjs from 'dayjs';

const { Text } = Typography;

interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: string;
  assignee_id?: number | null;
  deadline?: string;
  priority?: string;
  roadmap_item_id?: number | null;
}

function SortableTaskItem({ task, onClick, isHighlighted }: { task: Task, onClick: (task: Task) => void, isHighlighted?: boolean }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id.toString(), data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: '12px',
    cursor: 'grab'
  };

  const cardStyle = isHighlighted
    ? { borderRadius: '8px', border: '2px solid #1677ff', boxShadow: '0 0 8px rgba(22,119,255,0.5)', transition: 'all 0.3s', backgroundColor: '#e6f4ff' }
    : { borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.3s' };

  return (
    <div
      id={`task-card-${task.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick(task);
      }}
    >
      <Card size="small" style={cardStyle}>
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

function Column({ title, status, tasks, onAddTask, onTaskClick, hideAddButton, highlightTaskId }: { title: string, status: string, tasks: Task[], onAddTask: (status: string) => void, onTaskClick: (task: Task) => void, hideAddButton?: boolean, highlightTaskId?: string | null }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'Column', status }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        backgroundColor: isOver ? '#E5E7EB' : '#F3F4F6',
        padding: '16px',
        borderRadius: '8px',
        minHeight: '500px',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Text strong>{title} <Badge count={tasks.length} style={{ backgroundColor: '#E5E7EB', color: '#374151' }} /></Text>
        {!hideAddButton && <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => onAddTask(status)} />}
      </div>

      <SortableContext items={tasks.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
        <div style={{ flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          {tasks.map(task => (
            <SortableTaskItem key={task.id} task={task} onClick={onTaskClick} isHighlighted={highlightTaskId === task.id.toString()} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

interface KanbanBoardProps {
  projectId?: string | number;
  projectMembers?: any[];
  onTasksChanged?: () => void;
  isMember?: boolean;
  highlightTaskId?: string | null;
  highlightCommentId?: string | null;
  highlightExtension?: boolean;
  projectEndDate?: string;
}

export default function KanbanBoard({ projectId, projectMembers, onTasksChanged, isMember, highlightTaskId, highlightCommentId, highlightExtension, projectEndDate }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const dragStartTaskRef = useRef<Task | null>(null);   // task gốc khi bắt đầu kéo
  const dragTargetStatusRef = useRef<string>('');        // status đích khi kéo qua column

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const [detailTaskId, setDetailTaskId] = useState<string | number>('');
  const [currentStatusForNewTask, setCurrentStatusForNewTask] = useState('TODO');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterAssigneeId, setFilterAssigneeId] = useState<number | null>(null);

  const loadTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await TaskService.getTasks(projectId);
      const tasksList = Array.isArray(data) ? data : data.tasks || [];
      const mappedTasks = tasksList.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        assignee_id: t.assignee_id,
        assignee: t.assignee?.full_name,
        deadline: t.deadline ? dayjs(t.deadline).format('YYYY-MM-DD') : undefined,
        priority: t.priority,
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
    } catch (error) { }
  };

  useEffect(() => {
    loadTasks();
    loadMilestones();
  }, [projectId]);

  const location = useLocation();

  useEffect(() => {
    if (highlightTaskId) {
      if (highlightCommentId || highlightExtension) {
        setDetailTaskId(highlightTaskId);
        setIsDetailModalVisible(true);
      } else {
        setIsDetailModalVisible(false);
        setTimeout(() => {
          const el = document.getElementById(`task-card-${highlightTaskId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }
  }, [highlightTaskId, highlightCommentId, highlightExtension, location.search, tasks]);

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
        const payload = {
          title: values.title,
          description: values.description,
          priority: values.priority || 'MEDIUM',
          due_date: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
          roadmap_item_id: values.roadmap_item_id ?? null
        };
        await TaskService.updateTask(editingTask.id, payload);
        if (values.assignee_id !== undefined) {
          await TaskService.assignTask(editingTask.id, values.assignee_id);
        }
        message.success('Cập nhật task thành công!');
      } else {
        const payload = {
          project_id: Number(projectId),
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority || 'MEDIUM',
          assignee_id: values.assignee_id,
          due_date: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
          roadmap_item_id: values.roadmap_item_id ?? null
        };
        await TaskService.createTask(payload);
        message.success('Tạo task thành công!');
      }
      setIsModalVisible(false);
      setEditingTask(null);
      loadTasks();
      onTasksChanged?.();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.type === 'Task') {
      const task = active.data.current.task as Task;
      setActiveTask(task);
      dragStartTaskRef.current = task;
      dragTargetStatusRef.current = task.status; // khởi tạo bằng status hiện tại
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    if (!isActiveTask) return;

    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    let newStatus = '';
    if (isOverTask) {
      const overTask = tasks.find(t => t.id.toString() === overId);
      newStatus = overTask?.status || '';
    } else if (isOverColumn) {
      newStatus = over.data.current?.status || overId;
    }

    if (newStatus && ['TODO', 'IN_PROGRESS', 'DONE'].includes(newStatus)) {
      dragTargetStatusRef.current = newStatus; // cập nhật status đích vào ref
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id.toString() === activeId);
        if (activeIndex === -1) return prev;

        const currentTask = prev[activeIndex];
        if (currentTask.status === newStatus) {
          if (isOverTask) {
            const overIndex = prev.findIndex(t => t.id.toString() === overId);
            return arrayMove(prev, activeIndex, overIndex);
          }
          return prev;
        }

        const updatedTasks = [...prev];
        updatedTasks[activeIndex] = { ...currentTask, status: newStatus as any };

        if (isOverTask) {
          const overIndex = prev.findIndex(t => t.id.toString() === overId);
          return arrayMove(updatedTasks, activeIndex, overIndex);
        }
        return updatedTasks;
      });
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    const originalTask = dragStartTaskRef.current;
    const finalStatus = dragTargetStatusRef.current;
    dragStartTaskRef.current = null;
    dragTargetStatusRef.current = '';

    if (!over || !originalTask) return;

    const isActiveTask = active.data.current?.type === 'Task';
    if (!isActiveTask) return;

    // Chỉ gọi API nếu status thực sự thay đổi so với lúc bắt đầu kéo
    if (finalStatus && finalStatus !== originalTask.status) {
      try {
        await TaskService.updateTaskStatus(originalTask.id, finalStatus);
        onTasksChanged?.();
      } catch (error: any) {
        message.error(error.message || 'Lỗi cập nhật trạng thái');
        loadTasks(); // revert về dữ liệu gốc từ server
      }
    }
  };

  // Custom Thuật toán va chạm: Ưu tiên bắt theo toạ độ chuột trước, nếu lệch ra ngoài thì lấy va chạm gần nhất
  const customCollisionDetection = (args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const filteredTasks = filterAssigneeId
    ? tasks.filter(t => t.assignee_id === filterAssigneeId)
    : tasks;

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Select
          allowClear
          placeholder="Lọc theo thành viên"
          style={{ width: 250 }}
          value={filterAssigneeId}
          onChange={(val) => setFilterAssigneeId(val)}
          options={projectMembers?.map(member => ({
            value: member.user_id,
            label: member.user?.full_name || member.user?.username || `User ${member.user_id}`
          }))}
        />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection} // Thay thế closestCorners bằng custom logic nhảy chuột chuẩn xác
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
          <Column title="To Do" status="TODO" tasks={filteredTasks.filter(t => t.status === 'TODO')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} hideAddButton={isMember} highlightTaskId={!highlightCommentId ? highlightTaskId : undefined} />
          <Column title="In Progress" status="IN_PROGRESS" tasks={filteredTasks.filter(t => t.status === 'IN_PROGRESS')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} hideAddButton={true} highlightTaskId={!highlightCommentId ? highlightTaskId : undefined} />
          <Column title="Done" status="DONE" tasks={filteredTasks.filter(t => t.status === 'DONE')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} hideAddButton={true} highlightTaskId={!highlightCommentId ? highlightTaskId : undefined} />
        </div>

      <DragOverlay>
        {activeTask ? (
          <Card size="small" style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '100%', cursor: 'grabbing' }}>
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
        initialValues={editingTask ? { id: editingTask.id, title: editingTask.title, description: editingTask.description, assignee_id: editingTask.assignee_id, status: editingTask.status, priority: editingTask.priority || 'MEDIUM', deadline: editingTask.deadline ? dayjs(editingTask.deadline) : undefined, roadmap_item_id: editingTask.roadmap_item_id } : { status: currentStatusForNewTask, priority: 'MEDIUM' }}
        projectMembers={projectMembers}
        milestones={milestones}
        projectEndDate={projectEndDate}
      />

      <TaskDetailModal
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        taskId={detailTaskId}
        onEditClick={handleEditTaskClick}
        onDeleteSuccess={() => {
          setIsDetailModalVisible(false);
          loadTasks();
        }}
        isMember={isMember}
        highlightCommentId={highlightCommentId}
        highlightExtension={highlightExtension}
      />
    </DndContext>
    </>
  );
}