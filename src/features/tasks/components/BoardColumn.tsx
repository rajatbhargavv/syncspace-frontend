import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskCard } from './TaskCard';
import { QuickAddTask } from './QuickAddTask';
import type { Task, TaskProgressStatus } from '../types/task.types';

export interface BoardColumnProps {
  spaceId: string;
  status: TaskProgressStatus;
  label: string;
  tasks: Task[];
  onCreate: (status: TaskProgressStatus) => void;
  isInactive?: boolean;
  activeTaskId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  totalTasksCount?: number;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  spaceId,
  status,
  label,
  tasks,
  onCreate,
  isInactive = false,
  activeTaskId,
  isCollapsed = false,
  onToggleCollapse,
  totalTasksCount = 0,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const percentage =
    totalTasksCount > 0 ? Math.round((tasks.length / totalTasksCount) * 100) : 0;

  if (isCollapsed) {
    return (
      <section
        ref={setNodeRef}
        aria-label={`${label} column (collapsed)`}
        onClick={onToggleCollapse}
        className={`group relative flex min-h-[18rem] w-14 min-w-[3.5rem] cursor-pointer flex-col items-center justify-between rounded-card border p-2 transition-all ${
          isOver
            ? 'bg-accent/15 border-accent shadow-elevated ring-2 ring-accent'
            : 'border-border/70 bg-surface/40 hover:bg-surface-hover/60 shadow-card'
        }`}
        title={`Click to expand ${label} (${tasks.length} tasks)`}
      >
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            aria-label={`Expand ${label} column`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-text-muted hover:bg-accent/10 hover:text-accent"
          >
            ↔
          </button>
          <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[11px] font-bold text-text">
            {tasks.length}
          </span>
        </div>

        <div className="my-auto py-4 select-none [writing-mode:vertical-lr] rotate-180 text-xs font-bold uppercase tracking-wider text-text-muted group-hover:text-text">
          {label}
        </div>

        <div className="pb-1 text-[10px] text-text-muted">{percentage}%</div>
      </section>
    );
  }

  return (
    <section
      ref={setNodeRef}
      aria-label={`${label} column`}
      className={`flex min-h-[18rem] min-w-[min(84vw,20rem)] snap-start flex-col rounded-card border p-3.5 transition-all md:min-w-0 ${
        isOver
          ? 'bg-accent/10 border-accent shadow-elevated ring-2 ring-accent/30'
          : 'border-border/80 bg-surface/50 shadow-card'
      }`}
    >
      <header className="border-border/50 mb-3 flex flex-col gap-1.5 border-b pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-sm font-bold text-text">{label}</h2>
            <span
              className="bg-surface-hover/80 rounded-full px-2 py-0.5 text-xs font-semibold text-text-muted"
              title={`${tasks.length} tasks (${percentage}% of total)`}
            >
              {tasks.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                type="button"
                aria-label={`Collapse ${label} column`}
                onClick={onToggleCollapse}
                title="Collapse column"
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
              >
                ⇤
              </button>
            )}
            <Button
              aria-label={`Add task to ${label}`}
              size="sm"
              variant="ghost"
              disabled={isInactive}
              onClick={() => onCreate(status)}
              className="h-7 w-7 rounded-full px-0 text-base text-text-muted hover:bg-surface-hover hover:text-text"
            >
              +
            </Button>
          </div>
        </div>

        {/* Column completion / WIP progress bar */}
        {totalTasksCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/60">
              <div
                className={`h-full transition-all duration-300 ${
                  status === 'COMPLETED'
                    ? 'bg-success'
                    : status === 'IN_PROGRESS'
                      ? 'bg-accent'
                      : 'bg-text-muted/60'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted">{percentage}%</span>
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-0.5 md:max-h-[calc(100vh-20rem)]">
        {tasks.length === 0 && !activeTaskId && (
          <EmptyState title="Nothing here yet" className="flex-1 border-0 bg-transparent p-4" />
        )}
        {tasks.map((task) =>
          task._id === activeTaskId ? (
            <div
              key={task._id}
              className="border-accent/60 bg-accent-muted/20 min-h-32 rounded-card border border-dashed animate-pulse"
              aria-label="Task being moved"
            />
          ) : (
            <TaskCard key={task._id} task={task} spaceId={spaceId} />
          ),
        )}
      </div>

      <QuickAddTask spaceId={spaceId} status={status} disabled={isInactive} />
    </section>
  );
};
