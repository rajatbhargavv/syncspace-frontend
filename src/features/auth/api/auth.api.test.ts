import { describe, expect, it } from 'vitest';
import { getCurrentUser, login, logout, register } from './auth.api';

describe('auth.api', () => {
  it('getCurrentUser returns user profile', async () => {
    const user = await getCurrentUser();
    expect(user).toBeDefined();
    expect(user._id).toBe('user_12345');
    expect(user.name).toBe('Jane Doe');
    expect(user.plan).toBe('FREE');
  });

  it('login succeeds with valid credentials', async () => {
    const result = await login({
      email: 'jane@example.com',
      password: 'Password1!',
    });
    expect(result.message).toBe('Successfully logged in');
    expect(result.accessToken).toBe('mock-access-token');
  });

  it('login throws ApiError on invalid credentials', async () => {
    await expect(
      login({
        email: 'invalid@example.com',
        password: 'wrong',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('register creates a new user', async () => {
    const result = await register({
      name: 'Alice Wonder',
      email: 'alice@example.com',
      password: 'Password1!',
    });
    expect(result.message).toBe('Successfully created');
    expect(result.user?.name).toBe('Alice Wonder');
  });

  it('logout succeeds', async () => {
    const result = await logout();
    expect(result.message).toBe('Logged out successfully');
  });
});
