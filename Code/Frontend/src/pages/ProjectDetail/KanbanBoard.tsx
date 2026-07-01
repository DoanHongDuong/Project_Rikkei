import { useState } from 'react';
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
import { Card, Avatar, Typography, Badge, Tag, Button } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import TaskFormModal from './TaskFormModal';
import TaskDetailModal from './TaskDetailModal';

const { Text } = Typography;

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'inprogress' | 'done';
  assignee: string;
  deadline?: string;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Thiết kế giao diện Login', status: 'todo', assignee: 'Khoảng Phát', deadline: '25/08/2026' },
  { id: '2', title: 'Xây dựng layout Dashboard', status: 'todo', assignee: 'Huy', deadline: '26/08/2026' },
  { id: '3', title: 'Tích hợp API Users', status: 'inprogress', assignee: 'Dũng', deadline: '20/08/2026' },
  { id: '4', title: 'Fix bug Header', status: 'done', assignee: 'Khoảng Phát', deadline: '15/08/2026' },
];

function SortableTaskItem({ task, onClick }: { task: Task, onClick: (task: Task) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

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
          <Tag color={task.status === 'done' ? 'success' : task.status === 'inprogress' ? 'processing' : 'default'}>
            {task.status}
          </Tag>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text style={{ fontSize: '12px' }}>{task.assignee}</Text>
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
      
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <SortableTaskItem key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailTaskTitle, setDetailTaskTitle] = useState('');
  const [currentStatusForNewTask, setCurrentStatusForNewTask] = useState('todo');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = (status: string) => {
    setEditingTask(null);
    setCurrentStatusForNewTask(status);
    setIsModalVisible(true);
  };

  const handleTaskClick = (task: Task) => {
    setDetailTaskTitle(task.title);
    setIsDetailModalVisible(true);
  };

  const handleEditTaskClick = () => {
    const taskToEdit = tasks.find(t => t.title === detailTaskTitle);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setIsDetailModalVisible(false);
      setIsModalVisible(true);
    }
  };

  const handleModalOk = (values: any) => {
    if (editingTask) {
      // Sửa task
      setTasks(tasks.map(t => 
        t.id === editingTask.id ? { ...t, title: values.title, assignee: values.assignee || 'Unassigned', deadline: values.deadline ? (typeof values.deadline.format === 'function' ? values.deadline.format('DD/MM/YYYY') : values.deadline) : undefined } : t
      ));
    } else {
      // Thêm task mới
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: values.title,
        status: values.status,
        assignee: values.assignee || 'Unassigned',
        deadline: values.deadline ? (typeof values.deadline.format === 'function' ? values.deadline.format('DD/MM/YYYY') : values.deadline) : undefined
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalVisible(false);
    setEditingTask(null);
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

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    setTasks(prev => {
      const activeIndex = prev.findIndex(t => t.id === activeId);
      
      if (isOverTask) {
        const overIndex = prev.findIndex(t => t.id === overId);
        if (prev[activeIndex].status !== prev[overIndex].status) {
          const newTasks = [...prev];
          newTasks[activeIndex].status = prev[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      }
      
      if (isOverColumn) {
        const newTasks = [...prev];
        newTasks[activeIndex].status = over.data.current?.status;
        return arrayMove(newTasks, activeIndex, prev.length - 1);
      }

      return prev;
    });
  };

  const handleDragEnd = () => {
    setActiveTask(null);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
        <Column title="To Do" status="todo" tasks={tasks.filter(t => t.status === 'todo')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
        <Column title="In Progress" status="inprogress" tasks={tasks.filter(t => t.status === 'inprogress')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
        <Column title="Done" status="done" tasks={tasks.filter(t => t.status === 'done')} onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
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
              <Tag color={activeTask.status === 'done' ? 'success' : activeTask.status === 'inprogress' ? 'processing' : 'default'}>
                {activeTask.status}
              </Tag>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text style={{ fontSize: '12px' }}>{activeTask.assignee}</Text>
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
        initialValues={editingTask ? { id: editingTask.id, title: editingTask.title, assignee: editingTask.assignee, status: editingTask.status } : { status: currentStatusForNewTask }}
      />

      <TaskDetailModal 
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        taskTitle={detailTaskTitle}
        onEditClick={handleEditTaskClick}
      />
    </DndContext>
  );
}
