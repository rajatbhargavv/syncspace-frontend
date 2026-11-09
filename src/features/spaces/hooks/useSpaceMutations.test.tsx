import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import { useCreateSpace } from './useCreateSpace';
import { useUpdateSpace } from './useUpdateSpace';
import { useDeactivateSpace } from './useDeactivateSpace';
import type { Space } from '../types/space.types';

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper };
}

describe('space mutation hooks', () => {
  it('useCreateSpace creates space and updates cache', async () => {
    server.use(
      http.post(API_ENDPOINTS.SPACES.CREATE, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            message: 'Space created',
            space: { ...mockSpace, name: body.name },
          },
          { status: 201 },
        );
      }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateSpace(), { wrapper });

    await result.current.mutateAsync({
      name: 'Created Space',
      kind: 'CUSTOM',
      theme: { preset: 'ORBIT', mode: 'dark' },
      visibility: 'PRIVATE',
      joinPolicy: 'INVITE_ONLY',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('Created Space');
  });

  it('useUpdateSpace updates space and invalidates cache', async () => {
    server.use(
      http.put(API_ENDPOINTS.SPACES.UPDATE('space_abc'), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          message: 'Space updated',
          space: { ...mockSpace, name: body.name },
        });
      }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateSpace(), { wrapper });

    await result.current.mutateAsync({
      id: 'space_abc',
      data: { name: 'Renamed Space' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('Renamed Space');
  });

  it('useDeactivateSpace deactivates space', async () => {
    server.use(
      http.patch(API_ENDPOINTS.SPACES.DEACTIVATE('space_abc'), () => {
        return HttpResponse.json({
          message: 'Space deactivated',
          space: { ...mockSpace, status: 'Inactive' },
        });
      }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeactivateSpace(), { wrapper });

    await result.current.mutateAsync('space_abc');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('Inactive');
  });
});

