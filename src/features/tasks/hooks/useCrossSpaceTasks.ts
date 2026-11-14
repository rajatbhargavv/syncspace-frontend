import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/useAuth';
import { useSpaces, type Space } from '@/features/spaces';
import { queryKeys } from '@/lib/queryKeys';
import { getSpaceTasks } from '../api/task.api';
import { isOverdue } from '../utils/taskUtils';
import type { Task } from '../types/task.types';

export interface TaskWithSpace {
  task: Task;
  space: Space;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  completedCount: number;
  assignedCount: number;
  completedTasks: Task[];
  level: 0 | 1 | 2 | 3 | 4; // 0 = 0, 1 = 1, 2 = 2, 3 = 3-4, 4 = 5+
}

export function toLocalDateString(dateInput: string | Date | number): string {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useCrossSpaceTasks() {
  const { user } = useAuth();
  const spacesQuery = useSpaces();
  const activeSpaces = useMemo(() => {
    return (spacesQuery.data ?? []).filter((s) => s.status === 'Active');
  }, [spacesQuery.data]);

  const taskQueries = useQueries({
    queries: activeSpaces.map((space) => ({
      queryKey: queryKeys.tasks.bySpace(space._id),
      queryFn: () => getSpaceTasks(space._id),
      enabled: Boolean(user?._id),
    })),
  });

  const isLoading = spacesQuery.isLoading || taskQueries.some((q) => q.isLoading);
  const isError = spacesQuery.isError && activeSpaces.length === 0;

  const allTasksWithSpace = useMemo(() => {
    const list: TaskWithSpace[] = [];
    activeSpaces.forEach((space, index) => {
      const spaceTasks = taskQueries[index]?.data ?? [];
      for (const task of spaceTasks) {
        if (task.lifecycleStatus === 'DELETED') continue;
        list.push({ task, space });
      }
    });
    return list;
  }, [activeSpaces, taskQueries]);

  // Tasks relevant to current user
  const userTasksWithSpace = useMemo(() => {
    if (!user?._id) return [];
    return allTasksWithSpace.filter(({ task, space }) => {
      // If personal space, always user's task
      if (space.kind === 'MY_CORNER' || space.spaceType === 'Personal') return true;
      // If created by user
      if (task.createdBy === user._id) return true;
      // If assigned to user
      if (task.assignees?.some((a) => a.userId === user._id)) return true;
      return false;
    });
  }, [allTasksWithSpace, user?._id]);

  const todayStr = useMemo(() => toLocalDateString(new Date()), []);

  // Categorize tasks for Today's Agenda
  const agenda = useMemo(() => {
    const overdue: TaskWithSpace[] = [];
    const dueToday: TaskWithSpace[] = [];
    const inProgress: TaskWithSpace[] = [];
    const completedToday: TaskWithSpace[] = [];

    for (const item of userTasksWithSpace) {
      const { task } = item;
      const isCompleted = task.progressStatus === 'COMPLETED';
      const taskDeadlineDateStr = task.deadline ? toLocalDateString(task.deadline) : '';
      const taskUpdatedDateStr = task.updatedAt ? toLocalDateString(task.updatedAt) : '';

      if (isCompleted) {
        if (taskUpdatedDateStr === todayStr) {
          completedToday.push(item);
        }
      } else {
        if (isOverdue(task)) {
          overdue.push(item);
        } else if (taskDeadlineDateStr === todayStr) {
          dueToday.push(item);
        } else if (task.progressStatus === 'IN_PROGRESS') {
          inProgress.push(item);
        }
      }
    }

    return {
      overdue,
      dueToday,
      inProgress,
      completedToday,
      allActionable: [...overdue, ...dueToday, ...inProgress],
    };
  }, [userTasksWithSpace, todayStr]);

  // Activity calculation for heatmap (last 180 days ~ 6 months)
  const activityData = useMemo(() => {
    // Map: spaceId -> date -> list of tasks
    const bySpaceMap = new Map<string, Map<string, Task[]>>();
    // Map: date -> list of completed tasks
    const overallCompletedMap = new Map<string, Task[]>();
    // Map: date -> number of assigned/due tasks
    const overallAssignedMap = new Map<string, number>();

    for (const { task, space } of userTasksWithSpace) {
      // Completed date
      if (task.progressStatus === 'COMPLETED' && task.updatedAt) {
        const completedDate = toLocalDateString(task.updatedAt);
        const existing = overallCompletedMap.get(completedDate) ?? [];
        existing.push(task);
        overallCompletedMap.set(completedDate, existing);

        if (!bySpaceMap.has(space._id)) {
          bySpaceMap.set(space._id, new Map());
        }
        const spaceMap = bySpaceMap.get(space._id)!;
        const spaceTasks = spaceMap.get(completedDate) ?? [];
        spaceTasks.push(task);
        spaceMap.set(completedDate, spaceTasks);
      }

      // Deadline / assigned date
      if (task.deadline) {
        const deadlineDate = toLocalDateString(task.deadline);
        const curr = overallAssignedMap.get(deadlineDate) ?? 0;
        overallAssignedMap.set(deadlineDate, curr + 1);
      }
    }

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalCompleted = 0;

    // Check last 365 days in chronological order
    const now = new Date();
    const datesChronological: string[] = [];
    for (let i = 365; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      datesChronological.push(toLocalDateString(d));
    }

    for (const d of datesChronological) {
      const count = overallCompletedMap.get(d)?.length ?? 0;
      totalCompleted += count;
      if (count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Current streak (walking backwards from today)
    const todayCount = overallCompletedMap.get(todayStr)?.length ?? 0;
    let checkDate = new Date();
    if (todayCount === 0) {
      // If user hasn't completed a task today yet, check yesterday to maintain active streak
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dStr = toLocalDateString(checkDate);
      const count = overallCompletedMap.get(dStr)?.length ?? 0;
      if (count > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      overallCompletedMap,
      overallAssignedMap,
      bySpaceMap,
      currentStreak,
      longestStreak,
      totalCompleted,
    };
  }, [userTasksWithSpace, todayStr]);

  return {
    spaces: activeSpaces,
    userTasks: userTasksWithSpace,
    agenda,
    activityData,
    isLoading,
    isError,
    refetchAll: () => {
      void spacesQuery.refetch();
      taskQueries.forEach((q) => void q.refetch());
    },
  };
}
