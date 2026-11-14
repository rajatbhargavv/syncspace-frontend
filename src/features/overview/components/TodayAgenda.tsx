import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Badge } from '@/components/ui/Badge';
import { SpaceThemeDot } from '@/features/spaces';
import { useOpenTask } from '@/features/tasks/hooks/useOpenTask';
import { useUpdateTaskStatus } from '@/features/tasks/hooks/useUpdateTaskStatus';
import { formatDeadline, priorityMeta } from '@/features/tasks/utils/taskUtils';
import type { TaskWithSpace } from '@/features/tasks/hooks/useCrossSpaceTasks';
import type { TaskProgressStatus } from '@/features/tasks/types/task.types';

export interface TodayAgendaProps {
  agenda: {
    overdue: TaskWithSpace[];
    dueToday: TaskWithSpace[];
    inProgress: TaskWithSpace[];
    completedToday: TaskWithSpace[];
    allActionable: TaskWithSpace[];
  };
  isLoading?: boolean;
}

type FilterTab = 'all' | 'dueToday' | 'overdue' | 'inProgress' | 'completed';

export const TodayAgenda: React.FC<TodayAgendaProps> = ({ agenda, isLoading = false }) => {
  const { open } = useOpenTask();
  const updateStatus = useUpdateTaskStatus();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const totalTasks =
    agenda.overdue.length +
    agenda.dueToday.length +
    agenda.inProgress.length +
    agenda.completedToday.length;

  const completedCount = agenda.completedToday.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const getFilteredList = (): TaskWithSpace[] => {
    switch (activeTab) {
      case 'overdue':
        return agenda.overdue;
      case 'dueToday':
        return agenda.dueToday;
      case 'inProgress':
        return agenda.inProgress;
      case 'completed':
        return agenda.completedToday;
      case 'all':
      default:
        return [
          ...agenda.overdue,
          ...agenda.dueToday,
          ...agenda.inProgress,
          ...agenda.completedToday,
        ];
    }
  };

  const currentList = getFilteredList();

  const handleToggleStatus = (item: TaskWithSpace, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = item.task.progressStatus;
    let nextStatus: TaskProgressStatus = 'COMPLETED';
    if (currentStatus === 'COMPLETED') {
      nextStatus = 'TODO';
    } else if (currentStatus === 'TODO') {
      nextStatus = 'IN_PROGRESS';
    } else {
      nextStatus = 'COMPLETED';
    }

    updateStatus.mutate({
      taskId: item.task._id,
      spaceId: item.space._id,
      progressStatus: nextStatus,
    });
  };

  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <section
      aria-labelledby="today-agenda-heading"
      className="rounded-card border border-border bg-surface p-5 shadow-card"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 id="today-agenda-heading" className="font-heading text-lg font-bold text-text">
              Today's Agenda & Cross-Space Tasks
            </h2>
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
              {todayLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            All your tasks due, in progress, or scheduled for today across every space — personal & shared.
          </p>
        </div>

        {/* Daily Completion Progress Bar */}
        {totalTasks > 0 && (
          <div className="flex min-w-[180px] flex-col gap-1 sm:text-right">
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
              <span className="font-semibold text-text">
                {completedCount} of {totalTasks} completed
              </span>
              <span className="text-accent font-bold">({progressPercent}%)</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-accent text-text-inverse'
              : 'text-text-muted hover:bg-surface-hover hover:text-text'
          }`}
        >
          All ({totalTasks})
        </button>

        {agenda.overdue.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === 'overdue'
                ? 'bg-error text-text-inverse'
                : 'text-error hover:bg-error/10'
            }`}
          >
            🚨 Overdue ({agenda.overdue.length})
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('dueToday')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            activeTab === 'dueToday'
              ? 'bg-accent text-text-inverse'
              : 'text-text-muted hover:bg-surface-hover hover:text-text'
          }`}
        >
          Due Today ({agenda.dueToday.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inProgress')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            activeTab === 'inProgress'
              ? 'bg-accent text-text-inverse'
              : 'text-text-muted hover:bg-surface-hover hover:text-text'
          }`}
        >
          In Progress ({agenda.inProgress.length})
        </button>

        {agenda.completedToday.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === 'completed'
                ? 'bg-success text-text-inverse'
                : 'text-success hover:bg-success/10'
            }`}
          >
            ✓ Completed ({agenda.completedToday.length})
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="mt-4 space-y-2.5">
        {isLoading ? (
          <div className="space-y-2 py-4">
            <div className="h-14 rounded-card bg-surface-hover animate-pulse" />
            <div className="h-14 rounded-card bg-surface-hover animate-pulse" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-8 text-center">
            <span className="text-3xl">🎉</span>
            <p className="mt-2 text-sm font-semibold text-text">
              {activeTab === 'completed'
                ? 'No tasks completed yet today'
                : 'All clear! No pending tasks in this category.'}
            </p>
            <p className="text-xs text-text-muted">
              {activeTab === 'all'
                ? 'You are completely caught up across all spaces for today.'
                : 'Keep up the great momentum!'}
            </p>
          </div>
        ) : (
          currentList.map(({ task, space }) => {
            const isCompleted = task.progressStatus === 'COMPLETED';
            const isInProgress = task.progressStatus === 'IN_PROGRESS';
            const priority = priorityMeta[task.priority];

            return (
              <div
                key={task._id}
                onClick={() => open(task._id)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-card border p-3.5 transition-all cursor-pointer ${
                  isCompleted
                    ? 'border-border/60 bg-surface/40 opacity-75 hover:opacity-100'
                    : 'border-border bg-surface hover:border-accent hover:shadow-card'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Quick Status Toggle Button */}
                  <button
                    type="button"
                    title={`Click to mark as ${
                      isCompleted ? 'TODO' : isInProgress ? 'COMPLETED' : 'IN PROGRESS'
                    }`}
                    onClick={(e) => handleToggleStatus({ task, space }, e)}
                    disabled={updateStatus.isPending}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isCompleted
                        ? 'border-success bg-success text-white'
                        : isInProgress
                          ? 'border-accent bg-accent/20 text-accent font-bold'
                          : 'border-border hover:border-accent hover:bg-surface-hover'
                    }`}
                  >
                    {isCompleted ? '✓' : isInProgress ? '▶' : ''}
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? 'text-text-muted line-through' : 'text-text'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Module Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-accent/10 border border-accent/25 px-2 py-0.2 text-[10px] font-semibold text-accent"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metadata line: Space pill + Deadline */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      {/* Space identifier */}
                      <Link
                        to={ROUTES.space(space._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface-hover/80 px-2 py-0.5 hover:text-accent transition-colors"
                      >
                        <SpaceThemeDot theme={space.theme} size="sm" />
                        <span className="font-medium text-text">{space.name}</span>
                      </Link>

                      <span>•</span>

                      {/* Deadline label */}
                      <span className={isCompleted ? 'text-text-muted' : 'text-text'}>
                        {formatDeadline(task.deadline)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Priority + Status Pill */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Badge variant={priority.badgeVariant} size="sm">
                    {priority.label}
                  </Badge>

                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      isCompleted
                        ? 'bg-success/15 text-success'
                        : isInProgress
                          ? 'bg-accent/15 text-accent'
                          : 'bg-surface-hover text-text-muted'
                    }`}
                  >
                    {isCompleted ? 'Done' : isInProgress ? 'In Progress' : 'To Do'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
