import React, { useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState, ErrorState, Select, Skeleton } from '@/components/ui';
import { useSpace } from '@/features/spaces';
import { useSpaceMembers } from '@/features/members';
import { AuthContext } from '@/app/providers/AuthContext';
import { useMemberLookup } from '../hooks/useMemberLookup';
import { useOpenTask } from '../hooks/useOpenTask';
import { useSpaceTasks } from '../hooks/useSpaceTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useAddAssignee, useRemoveAssignee } from '../hooks/useAssigneeMutations';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import { TaskRow } from './TaskRow';
import type { Task, TaskProgressStatus } from '../types/task.types';
import { filterTasks } from '../utils/taskUtils';

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
  const addAssignee = useAddAssignee();
  const removeAssignee = useRemoveAssignee();
  const spaceMembers = useSpaceMembers(spaceId);
  const { getName } = useMemberLookup(spaceId);
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'assignee' | 'priority'>('none');
  const data = useMemo(() => {
    return filterTasks(rawTasks.data ?? [], filters, auth?.user?._id);
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
  const assigneeOptions = (spaceMembers.data ?? []).map((member) => ({
    value: member.userId._id,
    label: member.userId.name,
  }));
  const canChangeAssignee = (task: Task) => {
    const userId = auth?.user?._id;
    if (!userId || !space.data) return false;
    const ownerId = space.data.ownerId ?? space.data.owner;
    if (ownerId === userId) return true;
    if (!space.data.assigneePermission || space.data.assigneePermission === 'OWNER_AND_CREATOR') {
      return task.createdBy === userId;
    }
    if (space.data.assigneePermission === 'ALL_MEMBERS') {
      return (spaceMembers.data ?? []).some(
        (member) => member.userId._id === userId && member.status === 'ACTIVE',
      );
    }
    return false;
  };
  const changeAssignees = async (task: Task, assigneeIds: string[]) => {
    if (!canChangeAssignee(task)) return;
    const currentIds = new Set(task.assignees.map((assignment) => assignment.userId));
    const nextIds = new Set(assigneeIds);
    const removedIds = Array.from(currentIds).filter((userId) => !nextIds.has(userId));
    const addedIds = assigneeIds.filter((userId) => !currentIds.has(userId));
    if (removedIds.length === 0 && addedIds.length === 0) return;
    try {
      for (const userId of removedIds) {
        await removeAssignee.mutateAsync({ taskId: task._id, userId, spaceId });
      }
      for (const userId of addedIds) {
        await addAssignee.mutateAsync({ taskId: task._id, userId, spaceId });
      }
      toast.success(nextIds.size > 0 ? 'Assignees updated' : 'Task unassigned');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update assignee');
    }
  };

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
      filters.search ||
      filters.status?.length ||
      filters.priority?.length ||
      filters.assigneeIds?.length ||
      filters.assigneeId,
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
      className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
    >
      <div className="bg-surface-hover/20 flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
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
              assigneeOptions={assigneeOptions}
              canChangeAssignee={canChangeAssignee(task)}
              onAssigneeChange={(assigneeIds) => void changeAssignees(task, assigneeIds)}
            />
          ))}
        </div>
      ))}
    </section>
  );
};
