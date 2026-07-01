export interface Task {
  id: string | number;
  title: string;
  status: 'Completed' | 'In Progress' | 'Planning' | 'Delayed' | 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  dueDate: string;
}

export interface Milestone {
  id: number;
  roadmap_id: number;
  title: string;
  start_date: string;
  end_date: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  sort_order: number;
  
  // Fields from old mock that might be missing in backend but useful for UI fallback
  description?: string;
  progress?: number;
  owner?: string;
  tasks?: Task[];
}
