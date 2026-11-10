import { describe, expect, it } from 'vitest';
import { formatEventText, groupTimelineItems } from './timelineUtils';
import type { EventItem, CommentItem } from '../types/comment.types';

const baseEvent: EventItem = {
  _id: 'ev_1',
  kind: 'event',
  spaceId: 'sp_1',
  taskId: 't_1',
  type: 'TASK_CREATED',
  actorId: { _id: 'u_1', name: 'Alice' },
  createdAt: '2026-03-01T12:00:00.000Z',
  updatedAt: '2026-03-01T12:00:00.000Z',
};

describe('timelineUtils', () => {
  describe('formatEventText', () => {
    it('formats TASK_CREATED', () => {
      const text = formatEventText(baseEvent, 'CUSTOM');
      expect(text).toBe('created this task');
    });

    it('formats TASK_STATUS_CHANGED with custom status mapping', () => {
      const event: EventItem = {
        ...baseEvent,
        type: 'TASK_STATUS_CHANGED',
        meta: { newStatus: 'IN_PROGRESS' },
      };
      const text = formatEventText(event, 'BUILDERS_CIRCLE');
      expect(text).toContain('In progress');
    });

    it('formats ASSIGNEE_ADDED with memberLookup', () => {
      const event: EventItem = {
        ...baseEvent,
        type: 'ASSIGNEE_ADDED',
        meta: { assigneeId: 'u_2' },
      };
      const lookup = (id: string) => (id === 'u_2' ? 'Bob' : undefined);
      expect(formatEventText(event, 'BUILDERS_CIRCLE', lookup)).toBe('assigned Bob');
      expect(formatEventText(event, 'BUILDERS_CIRCLE')).toBe('added an assignee');
    });

    it('formats ASSIGNEE_REMOVED with memberLookup', () => {
      const event: EventItem = {
        ...baseEvent,
        type: 'ASSIGNEE_REMOVED',
        meta: { assigneeId: 'u_2' },
      };
      const lookup = (id: string) => (id === 'u_2' ? 'Bob' : undefined);
      expect(formatEventText(event, 'BUILDERS_CIRCLE', lookup)).toBe('removed Bob');
      expect(formatEventText(event, 'BUILDERS_CIRCLE')).toBe('removed an assignee');
    });

    it('formats SUBTASK_CREATED and SUBTASK_COMPLETED with title', () => {
      const created: EventItem = {
        ...baseEvent,
        type: 'SUBTASK_CREATED',
        meta: { title: 'Write tests' },
      };
      const completed: EventItem = {
        ...baseEvent,
        type: 'SUBTASK_COMPLETED',
        meta: { title: 'Write tests' },
      };
      expect(formatEventText(created)).toBe('added subtask "Write tests"');
      expect(formatEventText(completed)).toBe('completed subtask "Write tests"');
    });

    it('falls back gracefully on unknown event type', () => {
      const unknownEvent = {
        ...baseEvent,
        type: 'UNKNOWN_CUSTOM_TYPE' as unknown as EventItem['type'],
      };
      expect(formatEventText(unknownEvent)).toBe('activity: unknown custom type');
    });
  });

  describe('groupTimelineItems', () => {
    it('groups contiguous events and keeps comments distinct', () => {
      const comment1: CommentItem = {
        _id: 'c_1',
        kind: 'comment',
        taskId: 't_1',
        userId: { _id: 'u_1', name: 'Alice' },
        content: 'First comment',
        createdAt: '2026-03-01T12:01:00.000Z',
        updatedAt: '2026-03-01T12:01:00.000Z',
      };
      const comment2: CommentItem = {
        _id: 'c_2',
        kind: 'comment',
        taskId: 't_1',
        userId: { _id: 'u_2', name: 'Bob' },
        content: 'Second comment',
        createdAt: '2026-03-01T12:04:00.000Z',
        updatedAt: '2026-03-01T12:04:00.000Z',
      };
      const event1: EventItem = { ...baseEvent, _id: 'e_1' };
      const event2: EventItem = { ...baseEvent, _id: 'e_2', type: 'TASK_UPDATED' };

      const groups = groupTimelineItems([event1, event2, comment1, comment2]);
      expect(groups).toHaveLength(3);
      expect(groups[0]?.type).toBe('events');
      if (groups[0]?.type === 'events') {
        expect(groups[0].items).toHaveLength(2);
      }
      expect(groups[1]?.type).toBe('comment');
      expect(groups[2]?.type).toBe('comment');
    });
  });
});
