import { getSpaceKindConfig, type SpaceKind } from '@/features/spaces';
import { statusMeta } from '@/features/tasks';
import type { EventItem, TimelineItem, CommentItem } from '../types/comment.types';

export function formatEventText(
  event: EventItem,
  spaceKind: SpaceKind = 'BUILDERS_CIRCLE',
  memberLookup?: (userId: string) => string | undefined,
): string {
  const meta = event.meta ?? {};
  const kindConfig = getSpaceKindConfig(spaceKind);
  const taskNoun = kindConfig.wording.taskNounSingular.toLowerCase();
  const statuses = statusMeta(spaceKind);

  switch (event.type) {
    case 'TASK_CREATED':
      return `created this ${taskNoun}`;

    case 'TASK_STATUS_CHANGED': {
      const newStatus = typeof meta.newStatus === 'string' ? meta.newStatus : '';
      const statusLabel =
        newStatus in statuses
          ? statuses[newStatus as keyof typeof statuses].label
          : newStatus || 'new status';
      return `moved this to ${statusLabel}`;
    }

    case 'TASK_UPDATED':
      return `updated this ${taskNoun}`;

    case 'ASSIGNEE_ADDED': {
      const assigneeId = typeof meta.assigneeId === 'string' ? meta.assigneeId : '';
      const resolvedName = assigneeId && memberLookup ? memberLookup(assigneeId) : undefined;
      return resolvedName ? `assigned ${resolvedName}` : `added an assignee`;
    }

    case 'ASSIGNEE_REMOVED': {
      const assigneeId = typeof meta.assigneeId === 'string' ? meta.assigneeId : '';
      const resolvedName = assigneeId && memberLookup ? memberLookup(assigneeId) : undefined;
      return resolvedName ? `removed ${resolvedName}` : `removed an assignee`;
    }

    case 'ASSIGNEE_STATUS_CHANGED': {
      const newStatus = typeof meta.newStatus === 'string' ? meta.newStatus : 'updated status';
      return `updated status to ${newStatus.replace('_', ' ').toLowerCase()}`;
    }

    case 'SUBTASK_CREATED': {
      const title = typeof meta.title === 'string' && meta.title.trim() ? ` "${meta.title}"` : '';
      return `added subtask${title}`;
    }

    case 'SUBTASK_COMPLETED': {
      const title = typeof meta.title === 'string' && meta.title.trim() ? ` "${meta.title}"` : '';
      return `completed subtask${title}`;
    }

    case 'COMMENT_ADDED':
      return `commented`;

    default:
      return `activity: ${event.type.toLowerCase().replace(/_/g, ' ')}`;
  }
}

export type TimelineGroup =
  | { type: 'comment'; item: CommentItem }
  | { type: 'events'; items: EventItem[] };

export function groupTimelineItems(items: TimelineItem[]): TimelineGroup[] {
  const groups: TimelineGroup[] = [];
  let currentEvents: EventItem[] = [];

  for (const item of items) {
    if (item.kind === 'comment') {
      if (currentEvents.length > 0) {
        groups.push({ type: 'events', items: currentEvents });
        currentEvents = [];
      }
      groups.push({ type: 'comment', item });
    } else {
      currentEvents.push(item);
    }
  }

  if (currentEvents.length > 0) {
    groups.push({ type: 'events', items: currentEvents });
  }

  return groups;
}
