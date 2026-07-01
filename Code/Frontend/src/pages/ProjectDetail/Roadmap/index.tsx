import { useState, useEffect, useMemo } from 'react';
import { Skeleton, message } from 'antd';
import type { Milestone } from './types/roadmap';
import { mockRoadmapData } from './mock/roadmapData';
import RoadmapHeader from './components/RoadmapHeader';
import StatsCards from './components/StatsCards';
import Filters from './components/Filters';
import MilestoneTimeline from './components/MilestoneTimeline';
import EmptyState from './components/EmptyState';

export default function RoadmapTab() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setMilestones(mockRoadmapData);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredMilestones = useMemo(() => {
    if (!searchText) return milestones;
    return milestones.filter(m => m.title.toLowerCase().includes(searchText.toLowerCase()));
  }, [milestones, searchText]);

  const handleAddMilestone = () => {
    message.info('Add Milestone functionality coming soon!');
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
          <Filters />
          <MilestoneTimeline milestones={filteredMilestones} />
        </>
      )}
    </div>
  );
}
