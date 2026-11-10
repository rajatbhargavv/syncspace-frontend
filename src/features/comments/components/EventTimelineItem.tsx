import React from 'react';
import { formatDateTime, formatRelative } from '@/lib/date';
import type { SpaceKind } from '@/features/spaces';
import type { EventItem } from '../types/comment.types';
import { formatEventText } from '../utils/timelineUtils';

export interface EventTimelineItemProps {
  event: EventItem;
  spaceKind?: SpaceKind;
  memberLookup?: (userId: string) => string | undefined;
}

function getEventIcon(type: string): string {
  switch (type) {
    case 'TASK_CREATED':
      return '✦';
    case 'TASK_STATUS_CHANGED':
      return '→';
    case 'TASK_UPDATED':
      return '✎';
    case 'ASSIGNEE_ADDED':
    case 'ASSIGNEE_REMOVED':
    case 'ASSIGNEE_STATUS_CHANGED':
      return '👤';
    case 'SUBTASK_CREATED':
    case 'SUBTASK_COMPLETED':
      return '✓';
    default:
      return '•';
  }
}

export const EventTimelineItem: React.FC<EventTimelineItemProps> = ({
  event,
  spaceKind,
  memberLookup,
}) => {
  const text = formatEventText(event, spaceKind, memberLookup);
  const actorName = event.actor?.name || 'Someone';
  const relativeTime = formatRelative(event.createdAt);
  const fullTime = formatDateTime(event.createdAt);
  const icon = getEventIcon(event.type);

  return (
    <div className="relative flex items-center gap-3 py-1.5 pl-8 text-xs text-text-muted">
      {/* Node on vertical timeline */}
      <span
        aria-hidden="true"
        className="absolute left-2.5 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-surface-hover text-[10px] text-text-muted ring-4 ring-bg"
      >
        {icon}
      </span>

      <div className="flex flex-wrap items-center gap-1.5 leading-snug">
        <span className="font-semibold text-text">{actorName}</span>
        <span>{text}</span>
        <span className="text-text-muted/60">•</span>
        <time
          dateTime={new Date(event.createdAt).toISOString()}
          title={fullTime}
          className="cursor-default hover:underline"
        >
          {relativeTime}
        </time>
      </div>
    </div>
  );
};
