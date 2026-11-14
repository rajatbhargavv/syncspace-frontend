import { TASK_PRIORITY, TASK_PROGRESS_STATUS } from '@/config/constants';
import { getSpaceKindConfig } from '@/features/spaces';
import type { SpaceKind } from '@/features/spaces';
import type { Task, TaskFilters, TaskPriority, TaskProgressStatus } from '../types/task.types';

// ── Group tasks by progress status ──
export function groupTasksByStatus(tasks: Task[]): Record<TaskProgressStatus, Task[]> {
  const groups: Record<TaskProgressStatus, Task[]> = {
    [TASK_PROGRESS_STATUS.TODO]: [],
    [TASK_PROGRESS_STATUS.IN_PROGRESS]: [],
    [TASK_PROGRESS_STATUS.COMPLETED]: [],
  };

  for (const task of tasks) {
    if (task.lifecycleStatus === 'DELETED') continue;
    groups[task.progressStatus].push(task);
  }

  return groups;
}

// ── Priority weights for sorting ──
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  [TASK_PRIORITY.LOW]: 1,
  [TASK_PRIORITY.MEDIUM]: 2,
  [TASK_PRIORITY.HIGH]: 3,
  [TASK_PRIORITY.URGENT]: 4,
};

// ── Sort tasks ──
export function sortTasks(
  tasks: Task[],
  sort: 'deadline' | 'priority' | 'createdAt' = 'deadline',
  dir: 'asc' | 'desc' = sort === 'createdAt' ? 'desc' : 'asc',
): Task[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0;
    if (sort === 'priority') {
      comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    } else if (sort === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }

    return dir === 'desc' ? -comparison : comparison;
  });
}

// ── Filter tasks ──
export function filterTasks(tasks: Task[], filters: TaskFilters, currentUserId?: string): Task[] {
  let result = tasks.filter((t) => t.lifecycleStatus !== 'DELETED');

  // 1. Text Search (title, description & tags)
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        Boolean(task.description && task.description.toLowerCase().includes(q)) ||
        Boolean(task.tags?.some((t) => t.toLowerCase().includes(q))),
    );
  }

  // 2. Status filter
  if (filters.status && filters.status.length > 0) {
    const statusSet = new Set(filters.status);
    result = result.filter((task) => statusSet.has(task.progressStatus));
  }

  // 3. Priority filter
  if (filters.priority && filters.priority.length > 0) {
    const prioritySet = new Set(filters.priority);
    result = result.filter((task) => prioritySet.has(task.priority));
  }

  // 4. Tags filter
  const effectiveTags =
    filters.tags && filters.tags.length > 0
      ? filters.tags
      : filters.tag
        ? [filters.tag]
        : [];

  if (effectiveTags.length > 0) {
    const tagSet = new Set(effectiveTags.map((t) => t.toLowerCase()));
    result = result.filter((task) =>
      task.tags?.some((t) => tagSet.has(t.toLowerCase())),
    );
  }

  // 5. Assignee filter (supports multiple assignee IDs, 'me', and 'unassigned')
  const effectiveAssignees =
    filters.assigneeIds && filters.assigneeIds.length > 0
      ? filters.assigneeIds
      : filters.assigneeId
        ? [filters.assigneeId]
        : [];

  if (effectiveAssignees.length > 0) {
    result = result.filter((task) =>
      effectiveAssignees.some((target) => {
        if (target === 'unassigned') {
          return task.assignees.length === 0;
        }
        const targetUserId = target === 'me' ? currentUserId : target;
        return targetUserId ? task.assignees.some((a) => a.userId === targetUserId) : false;
      }),
    );
  }

  // 5. Client-side Sort
  return sortTasks(result, filters.sort ?? 'deadline', filters.dir);
}

// ── Check if task is overdue ──
export function isOverdue(task: { deadline: string; progressStatus: TaskProgressStatus }): boolean {
  if (task.progressStatus === TASK_PROGRESS_STATUS.COMPLETED) return false;
  const deadlineTime = new Date(task.deadline).getTime();
  return !isNaN(deadlineTime) && deadlineTime < Date.now();
}

// ── Format deadline into readable / relative text ──
export function formatDeadline(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = targetDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    if (diffDays === -1) return 'Yesterday (Overdue)';
    return `${Math.abs(diffDays)}d overdue`;
  }
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// ── Priority metadata ──
export interface PriorityMeta {
  label: string;
  color: string;
  badgeVariant: 'default' | 'outline' | 'accent' | 'success' | 'warning' | 'error';
  order: number;
}

export const priorityMeta: Record<TaskPriority, PriorityMeta> = {
  [TASK_PRIORITY.LOW]: {
    label: 'Low',
    color: 'text-text-muted',
    badgeVariant: 'outline',
    order: 1,
  },
  [TASK_PRIORITY.MEDIUM]: {
    label: 'Medium',
    color: 'text-info',
    badgeVariant: 'default',
    order: 2,
  },
  [TASK_PRIORITY.HIGH]: {
    label: 'High',
    color: 'text-warning',
    badgeVariant: 'warning',
    order: 3,
  },
  [TASK_PRIORITY.URGENT]: {
    label: 'Urgent',
    color: 'text-error',
    badgeVariant: 'error',
    order: 4,
  },
};

// ── Status metadata per space kind ──
export interface StatusMetaItem {
  status: TaskProgressStatus;
  label: string;
}

export function statusMeta(kind: SpaceKind): Record<TaskProgressStatus, StatusMetaItem> {
  const config = getSpaceKindConfig(kind);
  return {
    [TASK_PROGRESS_STATUS.TODO]: {
      status: TASK_PROGRESS_STATUS.TODO,
      label: config.wording.columns.todo,
    },
    [TASK_PROGRESS_STATUS.IN_PROGRESS]: {
      status: TASK_PROGRESS_STATUS.IN_PROGRESS,
      label: config.wording.columns.inProgress,
    },
    [TASK_PROGRESS_STATUS.COMPLETED]: {
      status: TASK_PROGRESS_STATUS.COMPLETED,
      label: config.wording.columns.done,
    },
  };
}

// ── Workload score calculation ──
/**
 * Computes workload score (1 to 5) for member task distribution.
 *
 * Thresholds:
 * - 0 active tasks: score 1 (idle / minimal workload)
 * - 1-2 active tasks: score 2 (light workload)
 * - 3-4 active tasks: score 3 (balanced workload)
 * - 5-6 active tasks: score 4 (heavy workload)
 * - 7+ active tasks: score 5 (maximum / overloaded)
 */
export function computeWorkload(
  tasks: Task[],
  userId: string,
): { score: 1 | 2 | 3 | 4 | 5; activeTasksCount: number } {
  const activeTasks = tasks.filter(
    (t) =>
      t.progressStatus !== TASK_PROGRESS_STATUS.COMPLETED &&
      t.lifecycleStatus !== 'DELETED' &&
      t.assignees.some((a) => a.userId === userId && a.status !== 'DONE'),
  );

  const count = activeTasks.length;
  let score: 1 | 2 | 3 | 4 | 5 = 1;

  if (count >= 7) score = 5;
  else if (count >= 5) score = 4;
  else if (count >= 3) score = 3;
  else if (count >= 1) score = 2;
  else score = 1;

  return { score, activeTasksCount: count };
}
