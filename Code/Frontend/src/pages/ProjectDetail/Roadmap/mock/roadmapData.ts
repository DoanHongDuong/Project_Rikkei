import type { Milestone } from '../types/roadmap';

export const mockRoadmapData: Milestone[] = [
  {
    id: 1,
    roadmap_id: 1,
    title: 'Authentication Module',
    description: 'Implement secure login, registration, and user session management.',
    status: 'DONE',
    progress: 100,
    owner: 'John Doe',
    start_date: '2026-01-10',
    end_date: '2026-02-15',
    sort_order: 0,
    tasks: [
      { id: 't1-1', title: 'Login API', status: 'Completed', priority: 'High', assignee: 'Jane Smith', dueDate: '2026-01-20' },
      { id: 't1-2', title: 'Register API', status: 'Completed', priority: 'High', assignee: 'Jane Smith', dueDate: '2026-01-25' },
      { id: 't1-3', title: 'Forgot Password Flow', status: 'Completed', priority: 'Medium', assignee: 'Alex', dueDate: '2026-02-05' },
    ]
  },
  {
    id: 2,
    roadmap_id: 1,
    title: 'Dashboard UI Revamp',
    description: 'Redesign the main dashboard to improve user experience and add new data widgets.',
    status: 'IN_PROGRESS',
    progress: 65,
    owner: 'Sarah Connor',
    start_date: '2026-02-20',
    end_date: '2026-04-10',
    sort_order: 1,
    tasks: [
      { id: 't2-1', title: 'Wireframing', status: 'Completed', priority: 'Medium', assignee: 'Sarah Connor', dueDate: '2026-02-25' },
      { id: 't2-2', title: 'Widget Components', status: 'IN_PROGRESS', priority: 'High', assignee: 'Mike', dueDate: '2026-03-15' },
    ]
  },
  {
    id: 3,
    roadmap_id: 1,
    title: 'Payment Gateway Integration',
    description: 'Integrate Stripe and PayPal for seamless subscription management.',
    status: 'TODO',
    progress: 0,
    owner: 'Bruce Wayne',
    start_date: '2026-03-01',
    end_date: '2026-04-01',
    sort_order: 2,
    tasks: [
      { id: 't3-1', title: 'Stripe API Setup', status: 'TODO', priority: 'High', assignee: 'Bruce Wayne', dueDate: '2026-03-10' },
    ]
  },
  {
    id: 4,
    roadmap_id: 1,
    title: 'Mobile App Beta Release',
    description: 'Prepare and launch the first beta version of the iOS and Android apps.',
    status: 'TODO',
    progress: 0,
    owner: 'Diana Prince',
    start_date: '2026-05-01',
    end_date: '2026-07-15',
    sort_order: 3,
    tasks: []
  }
];
