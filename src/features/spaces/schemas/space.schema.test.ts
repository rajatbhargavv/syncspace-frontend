import { describe, expect, it } from 'vitest';
import { createSpaceSchema, updateSpaceSchema } from './space.schema';

describe('space.schema', () => {
  const validCreatePayload = {
    name: '  Sprint 42 Space  ',
    description: 'A shared workspace for engineering tasks',
    kind: 'BUILDERS_CIRCLE' as const,
    theme: {
      preset: 'NEON_GRID' as const,
      mode: 'dark' as const,
    },
    visibility: 'PRIVATE' as const,
    joinPolicy: 'INVITE_ONLY' as const,
  };

  describe('createSpaceSchema', () => {
    it('parses valid payload and trims name', () => {
      const parsed = createSpaceSchema.parse(validCreatePayload);
      expect(parsed.name).toBe('Sprint 42 Space');
      expect(parsed.kind).toBe('BUILDERS_CIRCLE');
      expect(parsed.theme.preset).toBe('NEON_GRID');
      expect(parsed.theme.mode).toBe('dark');
      expect(parsed.visibility).toBe('PRIVATE');
      expect(parsed.joinPolicy).toBe('INVITE_ONLY');
    });

    it('allows empty description or default to empty string', () => {
      const withoutDesc = { ...validCreatePayload, description: undefined };
      const parsed = createSpaceSchema.parse(withoutDesc);
      expect(parsed.description).toBe('');
    });

    it('rejects names shorter than 3 characters after trimming', () => {
      const invalid = { ...validCreatePayload, name: '  ab  ' };
      const result = createSpaceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('at least 3 characters');
      }
    });

    it('rejects names longer than 50 characters', () => {
      const invalid = { ...validCreatePayload, name: 'a'.repeat(51) };
      const result = createSpaceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('at most 50 characters');
      }
    });

    it('rejects descriptions longer than 500 characters', () => {
      const invalid = { ...validCreatePayload, description: 'x'.repeat(501) };
      const result = createSpaceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('at most 500 characters');
      }
    });

    it('rejects invalid kind enum', () => {
      const invalid = { ...validCreatePayload, kind: 'NOT_A_KIND' };
      const result = createSpaceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid theme preset and mode', () => {
      const invalidPreset = {
        ...validCreatePayload,
        theme: { preset: 'UNKNOWN_PRESET', mode: 'dark' },
      };
      expect(createSpaceSchema.safeParse(invalidPreset).success).toBe(false);

      const invalidMode = {
        ...validCreatePayload,
        theme: { preset: 'ORBIT', mode: 'sepia' },
      };
      expect(createSpaceSchema.safeParse(invalidMode).success).toBe(false);
    });

    it('rejects invalid visibility and join policy', () => {
      const invalidVis = { ...validCreatePayload, visibility: 'SECRET' };
      expect(createSpaceSchema.safeParse(invalidVis).success).toBe(false);

      const invalidPolicy = { ...validCreatePayload, joinPolicy: 'ANYONE' };
      expect(createSpaceSchema.safeParse(invalidPolicy).success).toBe(false);
    });
  });

  describe('updateSpaceSchema', () => {
    it('accepts partial updates', () => {
      const update = {
        name: 'New Name',
        status: 'Inactive' as const,
      };
      const parsed = updateSpaceSchema.parse(update);
      expect(parsed.name).toBe('New Name');
      expect(parsed.status).toBe('Inactive');
      expect(parsed.description).toBeUndefined();
    });

    it('validates name length if provided in update', () => {
      const invalid = { name: 'hi' };
      const result = updateSpaceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('allows empty object as an update', () => {
      const parsed = updateSpaceSchema.parse({});
      expect(parsed).toEqual({});
    });
  });
});
