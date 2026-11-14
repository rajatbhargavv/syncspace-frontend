import { describe, expect, it } from 'vitest';
import {
  groupTasksByStatus,
  sortTasks,
  filterTasks,
  isOverdue,
  formatDeadline,
  priorityMeta,
  statusMeta,
  computeWorkload,
} from './taskUtils';
import type { Task } from '../types/task.types';

const baseTask: Task = {
  _id: '1',
  spaceId: 's1',
  createdBy: 'u1',
  title: 'Task 1',
  priority: 'MEDIUM',
  deadline: '2026-12-01T00:00:00.000Z',
  progressStatus: 'TODO',
  lifecycleStatus: 'ACTIVE',
  assignees: [{ userId: 'u1', status: 'TODO' }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('taskUtils', () => {
  describe('groupTasksByStatus', () => {
    it('groups active tasks by progressStatus and ignores DELETED tasks', () => {
      const tasks: Task[] = [
        { ...baseTask, _id: '1', progressStatus: 'TODO' },
        { ...baseTask, _id: '2', progressStatus: 'IN_PROGRESS' },
        { ...baseTask, _id: '3', progressStatus: 'COMPLETED' },
        { ...baseTask, _id: '4', progressStatus: 'TODO', lifecycleStatus: 'DELETED' },
      ];

      const groups = groupTasksByStatus(tasks);
      expect(groups.TODO).toHaveLength(1);
      expect(groups.IN_PROGRESS).toHaveLength(1);
      expect(groups.COMPLETED).toHaveLength(1);
      expect(groups.TODO[0]?._id).toBe('1');
    });
  });

  describe('sortTasks', () => {
    it('sorts by priority correctly (URGENT > HIGH > MEDIUM > LOW)', () => {
      const tasks: Task[] = [
        { ...baseTask, _id: 'low', priority: 'LOW' },
        { ...baseTask, _id: 'urgent', priority: 'URGENT' },
        { ...baseTask, _id: 'high', priority: 'HIGH' },
        { ...baseTask, _id: 'med', priority: 'MEDIUM' },
      ];

      const desc = sortTasks(tasks, 'priority', 'desc');
      expect(desc.map((t) => t.priority)).toEqual(['URGENT', 'HIGH', 'MEDIUM', 'LOW']);

      const asc = sortTasks(tasks, 'priority', 'asc');
      expect(asc.map((t) => t.priority)).toEqual(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
    });

    it('sorts by deadline', () => {
      const tasks: Task[] = [
        { ...baseTask, _id: 'later', deadline: '2026-12-10T00:00:00.000Z' },
        { ...baseTask, _id: 'earlier', deadline: '2026-12-01T00:00:00.000Z' },
      ];

      const sorted = sortTasks(tasks, 'deadline', 'asc');
      expect(sorted[0]?._id).toBe('earlier');
      expect(sorted[1]?._id).toBe('later');
    });
  });

  describe('isOverdue', () => {
    it('returns true if past deadline and not completed', () => {
      expect(isOverdue({ deadline: '2020-01-01T00:00:00.000Z', progressStatus: 'TODO' })).toBe(
        true,
      );
    });

    it('returns false if completed even if deadline passed', () => {
      expect(isOverdue({ deadline: '2020-01-01T00:00:00.000Z', progressStatus: 'COMPLETED' })).toBe(
        false,
      );
    });

    it('returns false if deadline is in the future', () => {
      const nextYear = new Date(Date.now() + 86400000 * 365).toISOString();
      expect(isOverdue({ deadline: nextYear, progressStatus: 'TODO' })).toBe(false);
    });
  });

  describe('formatDeadline', () => {
    it('formats today, tomorrow and overdue dates cleanly', () => {
      const today = new Date().toISOString();
      expect(formatDeadline(today)).toBe('Today');

      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      expect(formatDeadline(tomorrow)).toBe('Tomorrow');

      const past = new Date(Date.now() - 86400000 * 2).toISOString();
      expect(formatDeadline(past)).toContain('overdue');
    });
  });

  describe('priorityMeta & statusMeta', () => {
    it('returns proper priority metadata', () => {
      expect(priorityMeta.URGENT.label).toBe('Urgent');
      expect(priorityMeta.URGENT.order).toBe(4);
      expect(priorityMeta.LOW.order).toBe(1);
    });

    it('returns contextual column labels per space kind', () => {
      const builders = statusMeta('BUILDERS_CIRCLE');
      expect(builders.TODO.label).toBe('Backlog');
      expect(builders.IN_PROGRESS.label).toBe('In progress');
      expect(builders.COMPLETED.label).toBe('Shipped');

      const home = statusMeta('OUR_HOME');
      expect(home.TODO.label).toBe('To do');
      expect(home.IN_PROGRESS.label).toBe('Doing');
      expect(home.COMPLETED.label).toBe('Done');

      const studio = statusMeta('STUDIO');
      expect(studio.TODO.label).toBe('Planned');
      expect(studio.IN_PROGRESS.label).toBe('Active');
      expect(studio.COMPLETED.label).toBe('Delivered');
    });
  });

  describe('computeWorkload', () => {
    it('computes 1-5 score based on active task thresholds', () => {
      // 0 tasks -> score 1
      expect(computeWorkload([], 'u1')).toEqual({ score: 1, activeTasksCount: 0 });

      // 1 task -> score 2
      const oneTask: Task[] = [{ ...baseTask, assignees: [{ userId: 'u1', status: 'TODO' }] }];
      expect(computeWorkload(oneTask, 'u1')).toEqual({ score: 2, activeTasksCount: 1 });

      // 3 tasks -> score 3
      const threeTasks: Task[] = [
        { ...baseTask, _id: '1', assignees: [{ userId: 'u1', status: 'TODO' }] },
        { ...baseTask, _id: '2', assignees: [{ userId: 'u1', status: 'IN_PROGRESS' }] },
        { ...baseTask, _id: '3', assignees: [{ userId: 'u1', status: 'TODO' }] },
      ];
      expect(computeWorkload(threeTasks, 'u1')).toEqual({ score: 3, activeTasksCount: 3 });

      // Completed task is not counted in active workload
      const withCompleted: Task[] = [
        ...threeTasks,
        {
          ...baseTask,
          _id: '4',
          progressStatus: 'COMPLETED',
          assignees: [{ userId: 'u1', status: 'DONE' }],
        },
      ];
      expect(computeWorkload(withCompleted, 'u1')).toEqual({ score: 3, activeTasksCount: 3 });
    });
  });

  describe('filterTasks', () => {
    const tasks: Task[] = [
      {
        ...baseTask,
        _id: 't1',
        title: 'Fix auth bug',
        progressStatus: 'TODO',
        priority: 'HIGH',
        assignees: [{ userId: 'u1', status: 'TODO' }],
        tags: ['security', 'auth module'],
      },
      {
        ...baseTask,
        _id: 't2',
        title: 'Design navbar',
        progressStatus: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignees: [{ userId: 'u2', status: 'TODO' }],
        tags: ['frontend', 'ui module'],
      },
      {
        ...baseTask,
        _id: 't3',
        title: 'Fix the add inventory button',
        progressStatus: 'COMPLETED',
        priority: 'LOW',
        assignees: [{ userId: 'u3', status: 'DONE' }],
        tags: ['inventory module'],
      },
      {
        ...baseTask,
        _id: 't4',
        title: 'Unassigned chore',
        progressStatus: 'TODO',
        priority: 'LOW',
        assignees: [],
      },
      {
        ...baseTask,
        _id: 't5',
        title: 'Deleted task',
        lifecycleStatus: 'DELETED',
      },
    ];

    it('ignores DELETED tasks', () => {
      const result = filterTasks(tasks, {});
      expect(result.find((t) => t._id === 't5')).toBeUndefined();
      expect(result).toHaveLength(4);
    });

    it('filters by multiple assignees using assigneeIds', () => {
      const result = filterTasks(tasks, { assigneeIds: ['u1', 'u2'] });
      expect(result.map((t) => t._id)).toEqual(['t1', 't2']);
    });

    it('filters by unassigned', () => {
      const result = filterTasks(tasks, { assigneeId: 'unassigned' });
      expect(result.map((t) => t._id)).toEqual(['t4']);
    });

    it('filters by me', () => {
      const result = filterTasks(tasks, { assigneeId: 'me' }, 'u2');
      expect(result.map((t) => t._id)).toEqual(['t2']);
    });

    it('filters by text search and status', () => {
      const result = filterTasks(tasks, { search: 'auth', status: ['TODO'] });
      expect(result.map((t) => t._id)).toEqual(['t1']);
    });

    it('matches tasks by tag in text search', () => {
      const result = filterTasks(tasks, { search: 'inventory' });
      expect(result.map((t) => t._id)).toEqual(['t3']);
    });

    it('filters tasks by specific tags', () => {
      const result = filterTasks(tasks, { tags: ['inventory module'] });
      expect(result.map((t) => t._id)).toEqual(['t3']);
    });

    it('filters tasks by single tag property', () => {
      const result = filterTasks(tasks, { tag: 'security' });
      expect(result.map((t) => t._id)).toEqual(['t1']);
    });
  });
});
