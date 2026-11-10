import React from 'react';

export interface TaskDiscussionSlotProps {
  taskId: string;
  spaceId: string;
}

export const TaskDiscussionSlot: React.FC<TaskDiscussionSlotProps> = ({ taskId, spaceId }) => {
  return (
    <div
      data-testid="task-discussion-slot"
      className="rounded-card border border-dashed border-border p-4 text-center"
    >
      <p className="text-sm font-medium text-text">Discussion arrives in Phase 3</p>
      <p className="mt-1 text-xs text-text-muted">
        Task: {taskId} | Space: {spaceId}
      </p>
    </div>
  );
};
