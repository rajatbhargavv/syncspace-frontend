import React from 'react';
import { DiscussionTimeline } from '@/features/comments';

export interface TaskDiscussionSlotProps {
  taskId: string;
  spaceId: string;
}

export const TaskDiscussionSlot: React.FC<TaskDiscussionSlotProps> = ({ taskId, spaceId }) => {
  return (
    <section aria-labelledby="discussion-heading" className="space-y-3">
      <h3 id="discussion-heading" className="font-heading text-base font-semibold text-text">
        Discussion
      </h3>
      <DiscussionTimeline taskId={taskId} spaceId={spaceId} />
    </section>
  );
};
