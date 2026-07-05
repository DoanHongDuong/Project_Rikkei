export interface ExtensionRequest {
  id: number;
  task_id: number;
  requester_id: number;
  reviewed_by: number | null;
  current_deadline: string;
  requested_deadline: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  review_note: string | null;
  requested_at: string;
  reviewed_at: string | null;
}

export interface CreateExtensionRequestInput {
  taskId: number;
  requestedDeadline: string;
  reason: string;
}
