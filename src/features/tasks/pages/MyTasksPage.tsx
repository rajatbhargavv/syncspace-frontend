import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/app/providers/useAuth';
import { useSpaces } from '@/features/spaces';
import { SpaceThemeDot } from '@/features/spaces/components/SpaceThemeDot';
import { queryKeys } from '@/lib/queryKeys';
import { getSpaceTasks } from '../api/task.api';
import { formatDeadline, isOverdue, priorityMeta } from '../utils/taskUtils';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import type { Task, TaskProgressStatus } from '../types/task.types';

export const MyTasksPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const spaces = useSpaces();
  const updateStatus = useUpdateTaskStatus();
  const spaceList = (spaces.data ?? []).filter((space) => space.status === 'Active');
  const taskQueries = useQueries({
    queries: spaceList.map((space) => ({
      queryKey: queryKeys.tasks.bySpace(space._id, { assignee: user?._id }),
      queryFn: () => getSpaceTasks(space._id, { assignee: user?._id }),
      enabled: Boolean(user?._id),
    })),
  });
  const tasksBySpace = useMemo(
    () =>
      spaceList.map((space, index) => ({
        space,
        tasks: (taskQueries[index]?.data ?? []).filter(
          (task) => task.lifecycleStatus !== 'DELETED',
        ),
      })),
    [spaceList, taskQueries],
  );
  const failedSpaces = tasksBySpace.filter((_item, index) => taskQueries[index]?.isError);
  const allTasks = tasksBySpace.flatMap(({ space, tasks }) =>
    tasks.map((task) => ({ task, space })),
  );
  const sections = useMemo(
    () => ({
      overdue: allTasks.filter(({ task }) => isOverdue(task)),
      today: allTasks.filter(
        ({ task }) =>
          !isOverdue(task) && new Date(task.deadline).toDateString() === new Date().toDateString(),
      ),
      upcoming: allTasks.filter(
        ({ task }) =>
          !isOverdue(task) &&
          new Date(task.deadline).toDateString() !== new Date().toDateString() &&
          task.progressStatus !== 'COMPLETED',
      ),
      completed: allTasks.filter(({ task }) => task.progressStatus === 'COMPLETED'),
    }),
    [allTasks],
  );

  if (spaces.isLoading || taskQueries.some((query) => query.isLoading)) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Tasks" description="Unified task inbox across your active spaces." />
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
      </div>
    );
  }
  if (spaces.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Tasks" />
        <ErrorState message="Unable to load your spaces." onRetry={() => void spaces.refetch()} />
      </div>
    );
  }
  if (allTasks.length === 0 && failedSpaces.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Tasks" description="Unified task inbox across your active spaces." />
        <EmptyState
          title="No assigned tasks"
          description="Tasks assigned to you will appear here."
        />
      </div>
    );
  }

  const renderTask = ({ task, space }: { task: Task; space: (typeof spaceList)[number] }) => (
    <button
      key={`${space._id}-${task._id}`}
      type="button"
      onClick={() => navigate(`/spaces/${space._id}?task=${encodeURIComponent(task._id)}`)}
      className="flex w-full flex-col gap-3 rounded-card border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <SpaceThemeDot theme={space.theme} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{task.title}</p>
          <p className="mt-1 truncate text-xs text-text-muted">{space.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={priorityMeta[task.priority].badgeVariant} size="sm">
          {priorityMeta[task.priority].label}
        </Badge>
        <span
          className={
            isOverdue(task) ? 'text-xs font-semibold text-error' : 'text-xs text-text-muted'
          }
        >
          {formatDeadline(task.deadline)}
        </span>
        <select
          aria-label={`Status for ${task.title}`}
          value={task.progressStatus}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) =>
            updateStatus.mutate({
              taskId: task._id,
              spaceId: space._id,
              progressStatus: event.target.value as TaskProgressStatus,
            })
          }
          className="rounded-input border border-border bg-surface px-2 py-1 text-xs text-text"
        >
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Done</option>
        </select>
      </div>
    </button>
  );

  const section = (
    title: string,
    items: Array<{ task: Task; space: (typeof spaceList)[number] }>,
  ) =>
    items.length > 0 && (
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-text">{title}</h2>
        <div className="space-y-2">{items.map(renderTask)}</div>
      </section>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="Unified task inbox and priority list across all your spaces."
      />
      {failedSpaces.length > 0 && (
        <ErrorState
          title="Some spaces could not be loaded"
          message={failedSpaces.map(({ space }) => space.name).join(', ')}
        />
      )}
      <div className="space-y-8">
        {section('Overdue', sections.overdue)}
        {section('Due today', sections.today)}
        {section('Upcoming', sections.upcoming)}
        {section('Completed', sections.completed)}
      </div>
    </div>
  );
};
