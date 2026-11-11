import { describe, expect, it } from 'vitest';
import { passwordChangeSchema, profileSchema } from './settings.schema';

describe('settings schemas', () => {
  it('accepts backend-compatible profile values', () => {
    expect(profileSchema.safeParse({ name: 'Jane Doe', email: 'jane@example.com' }).success).toBe(
      true,
    );
    expect(profileSchema.safeParse({ name: 'J', email: 'bad' }).success).toBe(false);
  });

  it('enforces the backend password rules and confirmation', () => {
    expect(
      passwordChangeSchema.safeParse({ password: 'Password1!', confirmPassword: 'Password1!' })
        .success,
    ).toBe(true);
    expect(
      passwordChangeSchema.safeParse({ password: 'password', confirmPassword: 'password' }).success,
    ).toBe(false);
    expect(
      passwordChangeSchema.safeParse({ password: 'Password1!', confirmPassword: 'different' })
        .success,
    ).toBe(false);
  });
});
