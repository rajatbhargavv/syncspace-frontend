import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMemberLookup } from './useMemberLookup';

vi.mock('@/features/members', () => ({
  useSpaceMembers: () => ({
    data: [
      {
        userId: { _id: 'u1', name: 'Alice Smith' },
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        userId: { _id: 'u2', name: 'Bob Jones' },
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: '2026-01-02T00:00:00.000Z',
      },
    ],
    isLoading: false,
  }),
}));

describe('useMemberLookup', () => {
  it('resolves member by ID', () => {
    const { result } = renderHook(() => useMemberLookup('space_1'));

    expect(result.current.getMember('u1')).toEqual({ _id: 'u1', name: 'Alice Smith' });
    expect(result.current.getName('u1')).toBe('Alice Smith');
    expect(result.current.getName('u2')).toBe('Bob Jones');
  });

  it('falls back to "Former member" for unknown or removed users', () => {
    const { result } = renderHook(() => useMemberLookup('space_1'));

    expect(result.current.getMember('unknown_user')).toBeUndefined();
    expect(result.current.getName('unknown_user')).toBe('Former member');
  });
});
