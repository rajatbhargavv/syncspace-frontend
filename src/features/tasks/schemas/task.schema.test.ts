import { describe, expect, it } from 'vitest';
import {
  createTaskSchema,
  updateTaskSchema,
  addAssigneeSchema,
  updateAssigneeStatusSchema,
} from './task.schema';

describe('task.schema', () => {
  const validCreate = {
    spaceId: 'space_123',
    title: '  Implement task data layer  ',
    description: 'Build all schemas and types',
    priority: 'HIGH' as const,
    deadline: '2026-12-31T23:59:59.000Z',
  };

  describe('createTaskSchema', () => {
    it('parses valid payload, trims title, and retains valid fields', () => {
      const parsed = createTaskSchema.parse(validCreate);
      expect(parsed.spaceId).toBe('space_123');
      expect(parsed.title).toBe('Implement task data layer');
      expect(parsed.priority).toBe('HIGH');
      expect(parsed.deadline).toBe('2026-12-31T23:59:59.000Z');
      expect(parsed.description).toBe('Build all schemas and types');
    });

    it('defaults priority to MEDIUM and description to empty string', () => {
      const parsed = createTaskSchema.parse({
        spaceId: 'space_123',
        title: 'Simple task',
        deadline: '2026-12-31T00:00:00.000Z',
      });
      expect(parsed.priority).toBe('MEDIUM');
      expect(parsed.description).toBe('');
      expect(parsed.tags).toEqual([]);
    });

    it('accepts and trims tags', () => {
      const parsed = createTaskSchema.parse({
        ...validCreate,
        tags: ['  inventory module  ', 'bug'],
      });
      expect(parsed.tags).toEqual(['inventory module', 'bug']);
    });

    it('rejects empty tag or tag longer than 30 characters', () => {
      const res1 = createTaskSchema.safeParse({
        ...validCreate,
        tags: ['   '],
      });
      expect(res1.success).toBe(false);

      const res2 = createTaskSchema.safeParse({
        ...validCreate,
        tags: ['a'.repeat(31)],
      });
      expect(res2.success).toBe(false);
    });

    it('rejects empty title after trimming', () => {
      const res = createTaskSchema.safeParse({
        ...validCreate,
        title: '   ',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toContain('Title is required');
      }
    });

    it('rejects title longer than 100 characters', () => {
      const res = createTaskSchema.safeParse({
        ...validCreate,
        title: 'a'.repeat(101),
      });
      expect(res.success).toBe(false);
    });

    it('rejects invalid deadline format', () => {
      const res = createTaskSchema.safeParse({
        ...validCreate,
        deadline: 'not-a-date',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toContain('Invalid deadline format');
      }
    });

    it('rejects missing spaceId', () => {
      const res = createTaskSchema.safeParse({
        ...validCreate,
        spaceId: '',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('accepts valid partial update', () => {
      const parsed = updateTaskSchema.parse({
        title: 'Updated title',
        progressStatus: 'IN_PROGRESS',
      });
      expect(parsed.title).toBe('Updated title');
      expect(parsed.progressStatus).toBe('IN_PROGRESS');
    });

    it('accepts update with just tags', () => {
      const parsed = updateTaskSchema.parse({
        tags: ['inventory module'],
      });
      expect(parsed.tags).toEqual(['inventory module']);
    });

    it('rejects empty update object', () => {
      const res = updateTaskSchema.safeParse({});
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toContain('At least one field');
      }
    });

    it('rejects invalid status', () => {
      const res = updateTaskSchema.safeParse({
        progressStatus: 'UNKNOWN_STATUS',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('addAssigneeSchema & updateAssigneeStatusSchema', () => {
    it('validates assignee userId', () => {
      expect(addAssigneeSchema.parse({ userId: 'u_123' })).toEqual({ userId: 'u_123' });
      expect(addAssigneeSchema.safeParse({ userId: '' }).success).toBe(false);
    });

    it('validates assignee status', () => {
      expect(updateAssigneeStatusSchema.parse({ status: 'DONE' })).toEqual({ status: 'DONE' });
      expect(updateAssigneeStatusSchema.safeParse({ status: 'INVALID' }).success).toBe(false);
    });
  });
});
