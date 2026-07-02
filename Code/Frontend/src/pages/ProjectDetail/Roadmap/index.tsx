import { useState, useEffect, useMemo, useCallback } from 'react';
import { Skeleton, message } from 'antd';
import { useParams } from 'react-router-dom';
import type { Milestone } from './types/roadmap';
import RoadmapService from '../../../services/roadmapService';
import TaskService from '../../../services/taskService';
import ProjectService from '../../../services/projectService';
import TaskFormModal from '../TaskFormModal';
import RoadmapHeader from './components/RoadmapHeader';
import StatsCards from './components/StatsCards';
import MilestoneTimeline from './components/MilestoneTimeline';
import EmptyState from './components/EmptyState';
import MilestoneModal from './components/MilestoneModal';

export default function RoadmapTab() {
  const { id: projectId } = useParams();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [roadmapId, setRoadmapId] = useState<number | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  // Task modal state (tạo task trực tiếp từ 1 milestone)
  const [members, setMembers] = useState<any[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetMilestone, setTargetMilestone] = useState<Milestone | null>(null);

  // Fetch roadmap and items from API
  const fetchRoadmap = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      // Try to get existing roadmap
      let roadmap = await RoadmapService.getRoadmapByProject(projectId);

      // Auto-create roadmap if not exists
      if (!roadmap) {
        roadmap = await RoadmapService.createRoadmap(projectId, 'Project Roadmap');
      }

      setRoadmapId(roadmap.id);

      // Fetch items for this roadmap
      const items = await RoadmapService.getRoadmapItems(roadmap.id);
      setMilestones(items || []);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải dữ liệu roadmap');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  useEffect(() => {
    if (!projectId) return;
    ProjectService.getProjectMembers(projectId)
      .then(setMembers)
      .catch(() => {
        // Không tải được members cũng không chặn trang Roadmap hoạt động,
        // chỉ dropdown "Người thực hiện" trong modal tạo task sẽ trống.
      });
  }, [projectId]);

  const filteredMilestones = useMemo(() => {
    if (!searchText) return milestones;
    return milestones.filter(m => m.title.toLowerCase().includes(searchText.toLowerCase()));
  }, [milestones, searchText]);

  // ── CRUD Handlers ──

  const handleAddMilestone = () => {
    setEditingMilestone(null);
    setModalOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setModalOpen(true);
  };

  const handleDeleteMilestone = async (itemId: number) => {
    try {
      await RoadmapService.deleteRoadmapItem(itemId);
      message.success('Đã xóa mốc thời gian thành công!');
      fetchRoadmap();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xóa mốc thời gian');
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      if (editingMilestone) {
        // Update
        await RoadmapService.updateRoadmapItem(editingMilestone.id, values);
        message.success('Đã cập nhật mốc thời gian!');
      } else {
        // Create
        if (!roadmapId) {
          message.error('Roadmap chưa sẵn sàng');
          return;
        }
        await RoadmapService.createRoadmapItem(roadmapId, values);
        message.success('Đã thêm mốc thời gian mới!');
      }
      setModalOpen(false);
      fetchRoadmap();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi lưu mốc thời gian');
    }
  };

  const handleAddTaskForMilestone = (milestone: Milestone) => {
    setTargetMilestone(milestone);
    setIsTaskModalOpen(true);
  };

  const handleTaskStatusChange = async (taskId: string | number, newStatus: string) => {
    try {
      await TaskService.updateTaskStatus(taskId, newStatus);
      message.success('Đã cập nhật trạng thái công việc!');
      fetchRoadmap();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleTaskModalSubmit = async (values: any) => {
    if (!projectId) return;
    try {
      await TaskService.createTask({
        project_id: Number(projectId),
        title: values.title,
        description: values.description,
        status: values.status || 'TODO',
        priority: values.priority || 'MEDIUM',
        assignee_id: values.assignee_id,
        due_date: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
        roadmap_item_id: values.roadmap_item_id ?? targetMilestone?.id ?? null
      });
      message.success('Đã tạo task cho milestone!');
      setIsTaskModalOpen(false);
      setTargetMilestone(null);
      fetchRoadmap(); // refresh lại số "X tasks" và % progress của milestone
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tạo task');
    }
  };

  return (
    <div style={{ backgroundColor: '#F9FAFB', padding: 24, borderRadius: 8, minHeight: '600px' }}>
      <RoadmapHeader onSearch={setSearchText} onAddMilestone={handleAddMilestone} />

      {loading ? (
        <>
          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 24 }} />
          <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 24 }} />
        </>
      ) : milestones.length === 0 ? (
        <EmptyState onAdd={handleAddMilestone} />
      ) : (
        <>
          <StatsCards milestones={filteredMilestones} />
          <MilestoneTimeline
            milestones={filteredMilestones}
            onEdit={handleEditMilestone}
            onDelete={handleDeleteMilestone}
            onAddTask={handleAddTaskForMilestone}
            onTaskStatusChange={handleTaskStatusChange}
          />
        </>
      )}

      <MilestoneModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialValues={editingMilestone}
      />

      <TaskFormModal
        visible={isTaskModalOpen}
        onCancel={() => {
          setIsTaskModalOpen(false);
          setTargetMilestone(null);
        }}
        onOk={handleTaskModalSubmit}
        initialValues={{ status: 'TODO', priority: 'MEDIUM', roadmap_item_id: targetMilestone?.id }}
        projectMembers={members}
        milestones={milestones}
      />
    </div>
  );
}
