import React from 'react';

export interface TaskFilterBarProps {
  spaceId: string;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({ spaceId }) => {
  return (
    <div
      data-testid="task-filter-bar"
      aria-label="Task filters"
      className="flex items-center gap-2"
    >
      <span className="text-xs text-text-muted">Filters ({spaceId})</span>
    </div>
  );
};
