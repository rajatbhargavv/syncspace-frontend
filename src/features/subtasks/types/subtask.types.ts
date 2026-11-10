import { SUBTASK_STATUS } from '@/config/constants';
import type { TaskPriority } from '@/features/tasks';

// ── Enum-like union types ──
export type SubtaskStatus = (typeof SUBTASK_STATUS)[keyof typeof SUBTASK_STATUS];
export type SubtaskLifecycleStatus = 'ACTIVE' | 'DELETED';

// ── Subtask Model ──
export interface Subtask {
  _id: string;
  taskId: string;
  title: string;
  description?: string;
  assigneeId: string;
  priority: TaskPriority;
  deadline: string; // ISO string
  status: SubtaskStatus;
  lifecycleStatus?: SubtaskLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Mutation inputs ──
export interface CreateSubtaskInput {
  taskId: string;
  title: string;
  description?: string;
  assigneeId: string;
  priority?: TaskPriority;
  deadline: string; // ISO string, required
}

export interface UpdateSubtaskInput {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  deadline?: string;
  status?: SubtaskStatus;
}
