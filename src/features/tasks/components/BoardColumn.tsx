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
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  spaceId,
  status,
  label,
  tasks,
  onCreate,
  isInactive = false,
  activeTaskId,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      aria-label={`${label} column`}
      className={`flex min-h-[18rem] min-w-[min(84vw,20rem)] snap-start flex-col rounded-card border p-3 transition-colors md:min-w-0 ${
        isOver ? 'bg-accent-muted/30 border-accent' : 'bg-bg/50 border-border'
      }`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-sm font-bold text-text">
          {label} ({tasks.length})
        </h2>
        <Button
          aria-label={`Add task to ${label}`}
          size="sm"
          variant="ghost"
          disabled={isInactive}
          onClick={() => onCreate(status)}
          className="h-7 w-7 px-0 text-lg"
        >
          +
        </Button>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto md:max-h-[calc(100vh-20rem)]">
        {tasks.length === 0 && !activeTaskId && (
          <EmptyState title="Nothing here yet" className="flex-1 border-0 bg-transparent p-4" />
        )}
        {tasks.map((task) =>
          task._id === activeTaskId ? (
            <div
              key={task._id}
              className="border-accent/60 bg-accent-muted/20 min-h-32 rounded-card border border-dashed"
              aria-label="Task being moved"
            />
          ) : (
            <TaskCard key={task._id} task={task} spaceId={spaceId} />
          ),
        )}
      </div>
      {status === 'TODO' && <QuickAddTask spaceId={spaceId} disabled={isInactive} />}
    </section>
  );
};
