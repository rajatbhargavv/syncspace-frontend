import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import { queryKeys } from '@/lib/queryKeys';
import { useUpdateTaskStatus } from './useUpdateTaskStatus';
import type { Task } from '../types/task.types';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockTask: Task = {
  _id: 'task_100',
  spaceId: 'space_1',
  createdBy: 'user_1',
  title: 'Task for status update',
  priority: 'MEDIUM',
  deadline: '2026-12-31T00:00:00.000Z',
  progressStatus: 'TODO',
  lifecycleStatus: 'ACTIVE',
  assignees: [{ userId: 'user_1', status: 'TODO' }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

describe('useUpdateTaskStatus (Optimistic Updates & Rollback)', () => {
  it('optimistically updates task status on success', async () => {
    server.use(
      http.patch(API_ENDPOINTS.TASKS.UPDATE('task_100'), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          message: 'Task updated',
          task: { ...mockTask, ...body },
        });
      }),
    );

    const { queryClient, wrapper } = createWrapper();
    const spaceKey = queryKeys.tasks.bySpace('space_1');
    queryClient.setQueryData(spaceKey, [mockTask]);

    const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

    await result.current.mutateAsync({
      taskId: 'task_100',
      spaceId: 'space_1',
      progressStatus: 'IN_PROGRESS',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const updated = queryClient.getQueryData<Task[]>(spaceKey);
    expect(updated?.[0]?.progressStatus).toBe('IN_PROGRESS');
  });

  it('rolls back to previous status and displays toast error on server failure', async () => {
    server.use(
      http.patch(API_ENDPOINTS.TASKS.UPDATE('task_100'), () => {
        return HttpResponse.json({ message: 'Database error' }, { status: 500 });
      }),
    );

    const { queryClient, wrapper } = createWrapper();
    const spaceKey = queryKeys.tasks.bySpace('space_1');
    queryClient.setQueryData(spaceKey, [mockTask]);

    const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

    try {
      await result.current.mutateAsync({
        taskId: 'task_100',
        spaceId: 'space_1',
        progressStatus: 'COMPLETED',
      });
    } catch {
      // Expected mutation error
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
    // Verify rollback
    const rolledBack = queryClient.getQueryData<Task[]>(spaceKey);
    expect(rolledBack?.[0]?.progressStatus).toBe('TODO');
    expect(toast.error).toHaveBeenCalled();
  });
});
