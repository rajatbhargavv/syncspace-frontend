import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import { getSubtasks, createSubtask, updateSubtask, deleteSubtask } from './subtask.api';
import type { Subtask } from '../types/subtask.types';

const mockSubtask: Subtask = {
  _id: 'subtask_1',
  taskId: 'task_100',
  title: 'Check database migrations',
  description: '',
  assigneeId: '507f1f77bcf86cd799439011',
  priority: 'MEDIUM',
  deadline: '2026-12-31T00:00:00.000Z',
  status: 'TODO',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('subtask.api', () => {
  it('getSubtasks returns array of subtasks', async () => {
    server.use(
      http.get(API_ENDPOINTS.TASKS.SUBTASKS('task_100'), () => {
        return HttpResponse.json({
          message: 'Subtasks fetched',
          subtasks: [mockSubtask],
        });
      }),
    );

    const subtasks = await getSubtasks('task_100');
    expect(subtasks).toHaveLength(1);
    expect(subtasks[0]?._id).toBe('subtask_1');
    expect(subtasks[0]?.title).toBe('Check database migrations');
  });

  it('createSubtask posts new subtask and returns it', async () => {
    server.use(
      http.post(API_ENDPOINTS.TASKS.SUBTASKS('task_100'), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            message: 'Subtask created',
            subtask: { ...mockSubtask, title: body.title, _id: 'subtask_2' },
          },
          { status: 201 },
        );
      }),
    );

    const created = await createSubtask('task_100', {
      title: 'Run migrations',
      assigneeId: '507f1f77bcf86cd799439011',
      deadline: '2026-12-31T00:00:00.000Z',
    });

    expect(created._id).toBe('subtask_2');
    expect(created.title).toBe('Run migrations');
  });

  it('updateSubtask patches and returns subtask', async () => {
    server.use(
      http.patch(API_ENDPOINTS.SUBTASKS.UPDATE('subtask_1'), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          message: 'Subtask updated',
          subtask: { ...mockSubtask, ...body },
        });
      }),
    );

    const updated = await updateSubtask('subtask_1', { status: 'DONE' });
    expect(updated.status).toBe('DONE');
  });

  it('deleteSubtask removes and returns subtask', async () => {
    server.use(
      http.delete(API_ENDPOINTS.SUBTASKS.DELETE('subtask_1'), () => {
        return HttpResponse.json({
          message: 'Subtask deleted',
          subtask: mockSubtask,
        });
      }),
    );

    const deleted = await deleteSubtask('subtask_1');
    expect(deleted._id).toBe('subtask_1');
  });
});
