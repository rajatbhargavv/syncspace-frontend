import { TASK_PRIORITY, TASK_PROGRESS_STATUS, ASSIGNEE_STATUS } from '@/config/constants';

// ── Enum-like union types (derived from backend constants) ──
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];
export type TaskProgressStatus = (typeof TASK_PROGRESS_STATUS)[keyof typeof TASK_PROGRESS_STATUS];
export type AssigneeStatus = (typeof ASSIGNEE_STATUS)[keyof typeof ASSIGNEE_STATUS];
export type TaskLifecycleStatus = 'ACTIVE' | 'DELETED';

// ── Task Assignee ──
export interface TaskAssignee {
  userId: string;
  status: AssigneeStatus;
}

// ── Task Model ──
export interface Task {
  _id: string;
  spaceId: string;
  createdBy: string;
  title: string;
  description?: string;
  tags?: string[];
  priority: TaskPriority;
  deadline: string; // ISO string
  progressStatus: TaskProgressStatus;
  lifecycleStatus: TaskLifecycleStatus;
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
}

// ── Mutation inputs ──
export interface CreateTaskInput {
  spaceId: string;
  title: string;
  description?: string;
  tags?: string[];
  priority?: TaskPriority;
  deadline: string; // ISO string, required
  progressStatus?: TaskProgressStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  tags?: string[];
  priority?: TaskPriority;
  deadline?: string;
  progressStatus?: TaskProgressStatus;
}

export interface AddAssigneeInput {
  userId: string;
}

export interface UpdateMyAssigneeStatusInput {
  status: AssigneeStatus;
}

// ── Task Filters & Sorting ──
export interface TaskFilters {
  search?: string;
  status?: TaskProgressStatus[];
  priority?: TaskPriority[];
  tag?: string;
  tags?: string[];
  assigneeId?: 'me' | (string & {});
  assigneeIds?: string[];
  sort?: 'deadline' | 'priority' | 'createdAt';
  dir?: 'asc' | 'desc';
}
