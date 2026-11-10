import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useTaskFilters } from './useTaskFilters';

function createWrapper(initialUrl: string = '/spaces/s1') {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>
  );
  return wrapper;
}

describe('useTaskFilters', () => {
  it('reads initial filters from search parameters', () => {
    const wrapper = createWrapper(
      '/spaces/s1?q=bug&status=TODO,IN_PROGRESS&priority=HIGH&assignee=u1&sort=deadline&dir=asc',
    );
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(result.current.filters.search).toBe('bug');
    expect(result.current.filters.status).toEqual(['TODO', 'IN_PROGRESS']);
    expect(result.current.filters.priority).toEqual(['HIGH']);
    expect(result.current.filters.assigneeId).toBe('u1');
    expect(result.current.filters.sort).toBe('deadline');
    expect(result.current.filters.dir).toBe('asc');
  });

  it('updates filters in search parameters', () => {
    const wrapper = createWrapper('/spaces/s1');
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    act(() => {
      result.current.setFilters({ search: 'feature', priority: ['URGENT'] });
    });

    expect(result.current.filters.search).toBe('feature');
    expect(result.current.filters.priority).toEqual(['URGENT']);
  });

  it('resets filters cleanly', () => {
    const wrapper = createWrapper('/spaces/s1?q=test&status=TODO');
    const { result } = renderHook(() => useTaskFilters(), { wrapper });

    expect(result.current.filters.search).toBe('test');

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters.search).toBeUndefined();
    expect(result.current.filters.status).toBeUndefined();
  });
});
