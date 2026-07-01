export interface Task {
  id: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Planning' | 'Delayed';
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  dueDate: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Planning' | 'Delayed';
  progress: number;
  owner: string;
  startDate: string;
  dueDate: string;
  tasks: Task[];
}
