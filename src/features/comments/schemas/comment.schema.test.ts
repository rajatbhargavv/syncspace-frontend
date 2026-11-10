import { describe, expect, it } from 'vitest';
import { commentSchema } from './comment.schema';

describe('commentSchema', () => {
  it('accepts valid comment content', () => {
    const result = commentSchema.safeParse({ content: 'Looks great to me!' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Looks great to me!');
    }
  });

  it('trims leading and trailing whitespace', () => {
    const result = commentSchema.safeParse({ content: '   trimmed comment   ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('trimmed comment');
    }
  });

  it('rejects empty string', () => {
    const result = commentSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    const result = commentSchema.safeParse({ content: '    ' });
    expect(result.success).toBe(false);
  });

  it('rejects comment over 2000 characters', () => {
    const longContent = 'a'.repeat(2001);
    const result = commentSchema.safeParse({ content: longContent });
    expect(result.success).toBe(false);
  });

  it('accepts comment of exactly 2000 characters', () => {
    const maxContent = 'a'.repeat(2000);
    const result = commentSchema.safeParse({ content: maxContent });
    expect(result.success).toBe(true);
  });
});
