export interface Task {
  id: string | number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT';
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
  description?: string;
  progress?: number;
  owner?: string;
  tasks?: Task[];
}
