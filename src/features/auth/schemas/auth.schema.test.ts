import { describe, expect, it } from 'vitest';
import { checkPasswordCriteria, loginSchema, registerSchema } from './auth.schema';

describe('auth schemas', () => {
  describe('registerSchema', () => {
    it('validates a valid registration payload', () => {
      const valid = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password1!',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects names shorter than 3 characters', () => {
      const invalid = {
        name: 'Jo',
        email: 'jane@example.com',
        password: 'Password1!',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('at least 3 characters');
      }
    });

    it('rejects names with numbers or symbols', () => {
      const invalid = {
        name: 'Jane123',
        email: 'jane@example.com',
        password: 'Password1!',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('letters and spaces');
      }
    });

    it('rejects passwords shorter than 7 characters', () => {
      const invalid = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Pass1!',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('at least 7 characters');
      }
    });

    it('rejects passwords missing required character types', () => {
      // Missing special character
      const invalid = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('Password must include');
      }
    });
  });

  describe('loginSchema', () => {
    it('validates valid login credentials', () => {
      const valid = {
        email: 'jane@example.com',
        password: 'somepassword',
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'somepassword',
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const invalid = {
        email: 'jane@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('checkPasswordCriteria', () => {
    it('accurately verifies all criteria for a strong password', () => {
      const criteria = checkPasswordCriteria('Secure1@');
      expect(criteria.minLength).toBe(true);
      expect(criteria.hasUpper).toBe(true);
      expect(criteria.hasLower).toBe(true);
      expect(criteria.hasNumber).toBe(true);
      expect(criteria.hasSpecial).toBe(true);
    });

    it('identifies missing criteria', () => {
      const criteria = checkPasswordCriteria('simple');
      expect(criteria.minLength).toBe(false);
      expect(criteria.hasUpper).toBe(false);
      expect(criteria.hasLower).toBe(true);
      expect(criteria.hasNumber).toBe(false);
      expect(criteria.hasSpecial).toBe(false);
    });
  });
});
