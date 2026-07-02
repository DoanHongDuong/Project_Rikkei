import { Timeline } from 'antd';
import type { Milestone } from '../types/roadmap';
import MilestoneCard from './MilestoneCard';

export default function MilestoneTimeline({
  milestones,
  onEdit,
  onDelete,
  onAddTask,
  onTaskStatusChange
}: {
  milestones: Milestone[];
  onEdit?: (m: Milestone) => void;
  onDelete?: (id: number) => void;
  onAddTask?: (m: Milestone) => void;
  onTaskStatusChange?: (taskId: string | number, newStatus: string) => void;
}) {
  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'DONE': return '#10B981'; // Green
      case 'Completed': return '#10B981';
      case 'IN_PROGRESS': return '#3B82F6'; // Blue
      case 'In Progress': return '#3B82F6';
      case 'TODO': return '#F59E0B'; // Orange
      case 'Planning': return '#F59E0B';
      case 'Delayed': return '#EF4444'; // Red
      default: return 'gray';
    }
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <Timeline
        items={milestones.map(milestone => ({
          color: getTimelineColor(milestone.status),
          children: <MilestoneCard milestone={milestone} onEdit={onEdit} onDelete={onDelete} onAddTask={onAddTask} onTaskStatusChange={onTaskStatusChange} />,
        }))}
      />
    </div>
  );
}
