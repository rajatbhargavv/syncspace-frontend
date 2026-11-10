import React from 'react';
import type { Task } from '../types/task.types';

export interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
  [key: string]: unknown;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className, ...rest }) => {
  return (
    <div
      data-testid={`task-card-${task._id}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`cursor-pointer rounded-card border border-border bg-surface p-3 transition-colors hover:border-accent ${className ?? ''}`}
      {...rest}
    >
      <h4 className="font-heading text-sm font-semibold text-text">{task.title}</h4>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-text-muted">{task.description}</p>
      )}
    </div>
  );
};
