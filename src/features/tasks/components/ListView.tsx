import React, { useContext, useMemo, useState } from 'react';
import { EmptyState, ErrorState, Select, Skeleton } from '@/components/ui';
import { useSpace } from '@/features/spaces';
import { AuthContext } from '@/app/providers/AuthContext';
import {
  useMemberLookup,
  useOpenTask,
  useSpaceTasks,
  useTaskFilters,
  useUpdateTaskStatus,
} from '../index';
import { TaskRow } from './TaskRow';
import type { Task, TaskProgressStatus } from '../types/task.types';
import { sortTasks } from '../utils/taskUtils';

export interface ListViewProps {
  spaceId: string;
}

export const ListView: React.FC<ListViewProps> = ({ spaceId }) => {
  const rawTasks = useSpaceTasks(spaceId);
  const { filters, resetFilters } = useTaskFilters();
  const auth = useContext(AuthContext);
  const space = useSpace(spaceId);
  const { open } = useOpenTask();
  const updateStatus = useUpdateTaskStatus();
  const { getName } = useMemberLookup(spaceId);
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'assignee' | 'priority'>('none');
  const data = useMemo(() => {
    let result = (rawTasks.data ?? []).filter((task) => task.lifecycleStatus !== 'DELETED');
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query),
      );
    }
    if (filters.status?.length)
      result = result.filter((task) => filters.status?.includes(task.progressStatus));
    if (filters.priority?.length)
      result = result.filter((task) => filters.priority?.includes(task.priority));
    if (filters.assigneeId === 'unassigned')
      result = result.filter((task) => task.assignees.length === 0);
    if (filters.assigneeId === 'me' && auth?.user?._id)
      result = result.filter((task) =>
        task.assignees.some((assignee) => assignee.userId === auth.user?._id),
      );
    return sortTasks(result, filters.sort ?? 'deadline', filters.dir);
  }, [auth?.user?._id, filters, rawTasks.data]);
  const groups = useMemo(() => {
    const result = data;
    if (groupBy === 'none') return [['All tasks', result] as const];
    const grouped = new Map<string, Task[]>();
    for (const task of result) {
      const key =
        groupBy === 'status'
          ? task.progressStatus
          : groupBy === 'priority'
            ? task.priority
            : task.assignees[0]
              ? getName(task.assignees[0].userId)
              : 'Unassigned';
      const current = grouped.get(key);
      if (current) current.push(task);
      else grouped.set(key, [task]);
    }
    return Array.from(grouped.entries());
  }, [data, getName, groupBy]);

  if (rawTasks.isLoading || space.isLoading) {
    return (
      <div data-testid="list-view" className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-16" />
        ))}
      </div>
    );
  }
  if (rawTasks.isError || space.isError || !space.data) {
    return (
      <div data-testid="list-view">
        <ErrorState
          message="We could not load this task list."
          onRetry={() => {
            void rawTasks.refetch();
            void space.refetch();
          }}
        />
      </div>
    );
  }
  if (data.length === 0) {
    const hasFilters = Boolean(
      filters.search || filters.status?.length || filters.priority?.length || filters.assigneeId,
    );
    return (
      <div data-testid="list-view">
        <EmptyState
          title={hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
          description="Try changing the filters or create a task to get started."
          actionLabel={hasFilters ? 'Clear filters' : undefined}
          onAction={hasFilters ? resetFilters : undefined}
        />
      </div>
    );
  }

  return (
    <section
      data-testid="list-view"
      aria-label="Task list"
      className="overflow-hidden rounded-card border border-border bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
        <h2 className="font-heading text-lg font-semibold text-text">Tasks</h2>
        <Select
          aria-label="Group tasks by"
          value={groupBy}
          options={[
            { value: 'none', label: 'No grouping' },
            { value: 'status', label: 'Group by status' },
            { value: 'assignee', label: 'Group by assignee' },
            { value: 'priority', label: 'Group by priority' },
          ]}
          onChange={(event) => setGroupBy(event.target.value as typeof groupBy)}
          className="w-auto py-1.5 text-xs"
        />
      </div>
      {groups.map(([label, group]) => (
        <div key={label}>
          {groupBy !== 'none' && (
            <h3 className="border-border/60 bg-surface-hover/40 border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {label}
            </h3>
          )}
          {group.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              spaceId={spaceId}
              kind={space.data.kind}
              onOpen={() => open(task._id)}
              disabled={space.data.status === 'Inactive'}
              onStatusChange={(progressStatus: TaskProgressStatus) =>
                updateStatus.mutate({ taskId: task._id, spaceId, progressStatus })
              }
            />
          ))}
        </div>
      ))}
    </section>
  );
};
