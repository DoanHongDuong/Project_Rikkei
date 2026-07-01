import { Timeline } from 'antd';
import type { Milestone } from '../types/roadmap';
import MilestoneCard from './MilestoneCard';

export default function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Planning': return '#F59E0B';
      case 'Delayed': return '#EF4444';
      default: return 'gray';
    }
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <Timeline
        items={milestones.map(milestone => ({
          color: getTimelineColor(milestone.status),
          children: <MilestoneCard milestone={milestone} />,
        }))}
      />
    </div>
  );
}
