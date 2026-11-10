import { describe, expect, it } from 'vitest';
import { createSubtaskSchema, updateSubtaskSchema, subtaskStatusSchema } from './subtask.schema';

describe('subtask.schema', () => {
  const validCreate = {
    title: 'Write subtask tests',
    description: 'Unit test schema validation',
    assigneeId: '507f1f77bcf86cd799439011',
    priority: 'MEDIUM' as const,
    deadline: '2026-12-31T12:00:00.000Z',
  };

  describe('createSubtaskSchema', () => {
    it('parses valid subtask payload', () => {
      const parsed = createSubtaskSchema.parse(validCreate);
      expect(parsed.title).toBe('Write subtask tests');
      expect(parsed.assigneeId).toBe('507f1f77bcf86cd799439011');
      expect(parsed.priority).toBe('MEDIUM');
      expect(parsed.deadline).toBe('2026-12-31T12:00:00.000Z');
    });

    it('rejects invalid 24-character assigneeId', () => {
      const res = createSubtaskSchema.safeParse({
        ...validCreate,
        assigneeId: 'not-hex',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toContain('valid 24-character ID');
      }
    });

    it('rejects empty title', () => {
      const res = createSubtaskSchema.safeParse({
        ...validCreate,
        title: '   ',
      });
      expect(res.success).toBe(false);
    });

    it('rejects invalid deadline', () => {
      const res = createSubtaskSchema.safeParse({
        ...validCreate,
        deadline: 'not-a-valid-date',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('updateSubtaskSchema', () => {
    it('accepts partial update', () => {
      const parsed = updateSubtaskSchema.parse({
        status: 'DONE',
      });
      expect(parsed.status).toBe('DONE');
    });

    it('rejects empty object update', () => {
      const res = updateSubtaskSchema.safeParse({});
      expect(res.success).toBe(false);
    });
  });

  describe('subtaskStatusSchema', () => {
    it('validates subtask statuses', () => {
      expect(subtaskStatusSchema.parse('TODO')).toBe('TODO');
      expect(subtaskStatusSchema.parse('IN_PROGRESS')).toBe('IN_PROGRESS');
      expect(subtaskStatusSchema.parse('DONE')).toBe('DONE');
      expect(subtaskStatusSchema.safeParse('COMPLETED').success).toBe(false);
    });
  });
});
