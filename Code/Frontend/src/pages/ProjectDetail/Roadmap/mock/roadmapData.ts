import type { Milestone } from '../types/roadmap';

export const mockRoadmapData: Milestone[] = [
  {
    id: 'm1',
    title: 'Authentication Module',
    description: 'Implement secure login, registration, and user session management.',
    status: 'Completed',
    progress: 100,
    owner: 'John Doe',
    startDate: '2026-01-10',
    dueDate: '2026-02-15',
    tasks: [
      { id: 't1-1', title: 'Login API', status: 'Completed', priority: 'High', assignee: 'Jane Smith', dueDate: '2026-01-20' },
      { id: 't1-2', title: 'Register API', status: 'Completed', priority: 'High', assignee: 'Jane Smith', dueDate: '2026-01-25' },
      { id: 't1-3', title: 'Forgot Password Flow', status: 'Completed', priority: 'Medium', assignee: 'Alex', dueDate: '2026-02-05' },
      { id: 't1-4', title: 'Email Verification', status: 'Completed', priority: 'Low', assignee: 'Alex', dueDate: '2026-02-10' },
      { id: 't1-5', title: 'OAuth Integration', status: 'Completed', priority: 'Medium', assignee: 'Jane Smith', dueDate: '2026-02-15' },
    ]
  },
  {
    id: 'm2',
    title: 'Dashboard UI Revamp',
    description: 'Redesign the main dashboard to improve user experience and add new data widgets.',
    status: 'In Progress',
    progress: 65,
    owner: 'Sarah Connor',
    startDate: '2026-02-20',
    dueDate: '2026-04-10',
    tasks: [
      { id: 't2-1', title: 'Wireframing', status: 'Completed', priority: 'Medium', assignee: 'Sarah Connor', dueDate: '2026-02-25' },
      { id: 't2-2', title: 'Widget Components', status: 'In Progress', priority: 'High', assignee: 'Mike', dueDate: '2026-03-15' },
      { id: 't2-3', title: 'Responsive Layouts', status: 'In Progress', priority: 'High', assignee: 'Mike', dueDate: '2026-03-25' },
      { id: 't2-4', title: 'Dark Mode Support', status: 'Planning', priority: 'Low', assignee: 'Jane Smith', dueDate: '2026-04-05' },
      { id: 't2-5', title: 'User Testing', status: 'Planning', priority: 'Medium', assignee: 'Sarah Connor', dueDate: '2026-04-10' },
    ]
  },
  {
    id: 'm3',
    title: 'Payment Gateway Integration',
    description: 'Integrate Stripe and PayPal for seamless subscription management.',
    status: 'Delayed',
    progress: 30,
    owner: 'Bruce Wayne',
    startDate: '2026-03-01',
    dueDate: '2026-04-01',
    tasks: [
      { id: 't3-1', title: 'Stripe API Setup', status: 'Completed', priority: 'High', assignee: 'Bruce Wayne', dueDate: '2026-03-10' },
      { id: 't3-2', title: 'Subscription Webhooks', status: 'In Progress', priority: 'High', assignee: 'Bruce Wayne', dueDate: '2026-03-20' },
      { id: 't3-3', title: 'PayPal Integration', status: 'Delayed', priority: 'Medium', assignee: 'Clark', dueDate: '2026-03-25' },
      { id: 't3-4', title: 'Invoice Generation', status: 'Planning', priority: 'Low', assignee: 'Clark', dueDate: '2026-03-28' },
      { id: 't3-5', title: 'Payment Error Handling', status: 'Planning', priority: 'High', assignee: 'Bruce Wayne', dueDate: '2026-04-01' },
    ]
  },
  {
    id: 'm4',
    title: 'Mobile App Beta Release',
    description: 'Prepare and launch the first beta version of the iOS and Android apps.',
    status: 'Planning',
    progress: 0,
    owner: 'Diana Prince',
    startDate: '2026-05-01',
    dueDate: '2026-07-15',
    tasks: [
      { id: 't4-1', title: 'Setup React Native Init', status: 'Planning', priority: 'High', assignee: 'Barry', dueDate: '2026-05-10' },
      { id: 't4-2', title: 'Navigation Architecture', status: 'Planning', priority: 'High', assignee: 'Barry', dueDate: '2026-05-20' },
      { id: 't4-3', title: 'Offline Storage', status: 'Planning', priority: 'Medium', assignee: 'Diana Prince', dueDate: '2026-06-10' },
      { id: 't4-4', title: 'Push Notifications', status: 'Planning', priority: 'High', assignee: 'Diana Prince', dueDate: '2026-06-25' },
      { id: 't4-5', title: 'App Store Submission', status: 'Planning', priority: 'High', assignee: 'Diana Prince', dueDate: '2026-07-15' },
    ]
  },
  {
    id: 'm5',
    title: 'Data Analytics Pipeline',
    description: 'Build a robust data pipeline to process daily metrics and user behaviors.',
    status: 'In Progress',
    progress: 45,
    owner: 'Arthur',
    startDate: '2026-03-15',
    dueDate: '2026-05-20',
    tasks: [
      { id: 't5-1', title: 'Database Schema', status: 'Completed', priority: 'High', assignee: 'Arthur', dueDate: '2026-03-20' },
      { id: 't5-2', title: 'ETL Scripts', status: 'In Progress', priority: 'High', assignee: 'Arthur', dueDate: '2026-04-10' },
      { id: 't5-3', title: 'Metabase Dashboard', status: 'Planning', priority: 'Medium', assignee: 'Victor', dueDate: '2026-04-30' },
      { id: 't5-4', title: 'Data Export Feature', status: 'Planning', priority: 'Low', assignee: 'Victor', dueDate: '2026-05-10' },
      { id: 't5-5', title: 'Performance Tuning', status: 'Planning', priority: 'Medium', assignee: 'Arthur', dueDate: '2026-05-20' },
    ]
  },
  {
    id: 'm6',
    title: 'Localization (i18n)',
    description: 'Translate the platform into 5 major languages and support RTL layouts.',
    status: 'Planning',
    progress: 0,
    owner: 'Natasha',
    startDate: '2026-06-01',
    dueDate: '2026-07-01',
    tasks: [
      { id: 't6-1', title: 'Extract i18n keys', status: 'Planning', priority: 'High', assignee: 'Natasha', dueDate: '2026-06-05' },
      { id: 't6-2', title: 'Integrate translation tool', status: 'Planning', priority: 'Medium', assignee: 'Natasha', dueDate: '2026-06-10' },
      { id: 't6-3', title: 'RTL CSS Support', status: 'Planning', priority: 'Medium', assignee: 'Clint', dueDate: '2026-06-20' },
      { id: 't6-4', title: 'Language Switcher UI', status: 'Planning', priority: 'Low', assignee: 'Clint', dueDate: '2026-06-25' },
      { id: 't6-5', title: 'Review Translations', status: 'Planning', priority: 'High', assignee: 'Natasha', dueDate: '2026-07-01' },
    ]
  },
  {
    id: 'm7',
    title: 'Security Audit & Fixes',
    description: 'Conduct a thorough security audit and patch vulnerabilities.',
    status: 'Completed',
    progress: 100,
    owner: 'Tony',
    startDate: '2025-11-01',
    dueDate: '2025-12-15',
    tasks: [
      { id: 't7-1', title: 'Penetration Testing', status: 'Completed', priority: 'High', assignee: 'Tony', dueDate: '2025-11-15' },
      { id: 't7-2', title: 'Fix XSS vulnerabilities', status: 'Completed', priority: 'High', assignee: 'Steve', dueDate: '2025-11-25' },
      { id: 't7-3', title: 'Update dependencies', status: 'Completed', priority: 'Medium', assignee: 'Steve', dueDate: '2025-12-05' },
      { id: 't7-4', title: 'Implement Rate Limiting', status: 'Completed', priority: 'High', assignee: 'Tony', dueDate: '2025-12-10' },
      { id: 't7-5', title: 'Final Report', status: 'Completed', priority: 'Low', assignee: 'Tony', dueDate: '2025-12-15' },
    ]
  },
  {
    id: 'm8',
    title: 'Customer Success Portal',
    description: 'A portal for CS team to manage tickets, feedback, and user accounts directly.',
    status: 'In Progress',
    progress: 20,
    owner: 'Wanda',
    startDate: '2026-04-01',
    dueDate: '2026-06-30',
    tasks: [
      { id: 't8-1', title: 'Requirement Gathering', status: 'Completed', priority: 'High', assignee: 'Wanda', dueDate: '2026-04-10' },
      { id: 't8-2', title: 'Ticketing System API', status: 'In Progress', priority: 'High', assignee: 'Vision', dueDate: '2026-05-01' },
      { id: 't8-3', title: 'User Impersonation', status: 'Planning', priority: 'High', assignee: 'Vision', dueDate: '2026-05-20' },
      { id: 't8-4', title: 'Knowledge Base CMS', status: 'Planning', priority: 'Medium', assignee: 'Wanda', dueDate: '2026-06-15' },
      { id: 't8-5', title: 'CS Training', status: 'Planning', priority: 'Low', assignee: 'Wanda', dueDate: '2026-06-30' },
    ]
  }
];
