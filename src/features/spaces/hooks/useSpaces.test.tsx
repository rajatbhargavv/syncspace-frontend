import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import { useSpaces } from './useSpaces';
import { useSpace } from './useSpace';
import { usePublicSpace } from './usePublicSpace';
import type { Space, SpaceSummary, PublicSpace } from '../types/space.types';

const mockSpace: Space = {
  _id: 'space_abc',
  name: 'Test Space',
  description: 'A test space',
  kind: 'OUR_HOME',
  theme: { preset: 'HEARTH', mode: 'light' },
  visibility: 'PRIVATE',
  joinPolicy: 'INVITE_ONLY',
  status: 'Active',
  owner: 'user_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockSummary: SpaceSummary = {
  ...mockSpace,
  myRole: 'OWNER',
  memberCount: 3,
};

const mockPublic: PublicSpace = {
  _id: 'space_abc',
  name: 'Public Test Space',
  description: 'Public test',
  kind: 'STUDIO',
  theme: { preset: 'IVORY_INK', mode: 'light' },
  visibility: 'PUBLIC',
  joinPolicy: 'OPEN',
  status: 'Active',
  createdAt: '2026-01-01T00:00:00.000Z',
  owner: { _id: 'user_2', name: 'Bob' },
  contributorStats: { totalContributors: 4, totalTasks: 10, completedTasks: 8 },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper };
}

describe('space query hooks', () => {
  it('useSpaces fetches user spaces list', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.LIST, () => {
        return HttpResponse.json({
          message: 'Spaces fetched',
          spaces: [mockSummary],
        });
      }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSpaces(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.name).toBe('Test Space');
  });

  it('useSpace fetches space by id', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.BY_ID('space_abc'), () => {
        return HttpResponse.json({
          message: 'Space fetched',
          space: mockSpace,
        });
      }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSpace('space_abc'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?._id).toBe('space_abc');
    expect(result.current.data?.kind).toBe('OUR_HOME');
  });

  it('usePublicSpace fetches public space by id', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.PUBLIC('space_abc'), () => {
        return HttpResponse.json({
          message: 'Public space fetched',
          space: mockPublic,
        });
      }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePublicSpace('space_abc'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('Public Test Space');
    expect(result.current.data?.contributorStats.totalTasks).toBe(10);
  });
});

