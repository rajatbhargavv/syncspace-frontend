import { useMemo } from 'react';
import { useAuth } from '@/app/providers/useAuth';
import { useSpaceTasks } from './useSpaceTasks';
import { useTaskFilters } from './useTaskFilters';
import { sortTasks } from '../utils/taskUtils';

export function useFilteredTasks(spaceId: string) {
  const tasksQuery = useSpaceTasks(spaceId);
  const { filters, setFilters, resetFilters } = useTaskFilters();
  const { user } = useAuth();
  const currentUserId = user?._id;

  const filteredTasks = useMemo(() => {
    const rawTasks = tasksQuery.data ?? [];
    let result = rawTasks.filter((t) => t.lifecycleStatus !== 'DELETED');

    // 1. Text Search (title & description)
    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q)),
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

    // 4. Assignee filter (supports 'me' or specific userId)
    if (filters.assigneeId) {
      const targetUserId = filters.assigneeId === 'me' ? currentUserId : filters.assigneeId;
      if (targetUserId) {
        result = result.filter((task) => task.assignees.some((a) => a.userId === targetUserId));
      }
    }

    // 5. Client-side Sort
    return sortTasks(result, filters.sort ?? 'deadline', filters.dir);
  }, [tasksQuery.data, filters, currentUserId]);

  return {
    ...tasksQuery,
    data: filteredTasks,
    rawTasks: tasksQuery.data ?? [],
    filters,
    setFilters,
    resetFilters,
  };
}
