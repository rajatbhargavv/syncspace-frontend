import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import {
  getSpaceTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addAssignee,
  removeAssignee,
  updateMyAssigneeStatus,
} from './task.api';
import type { Task } from '../types/task.types';

const mockTask: Task = {
  _id: 'task_100',
  spaceId: 'space_1',
  createdBy: 'user_1',
  title: 'Write unit tests',
  description: 'MSW tests for task api',
  priority: 'HIGH',
  deadline: '2026-12-31T23:59:59.000Z',
  progressStatus: 'TODO',
  lifecycleStatus: 'ACTIVE',
  assignees: [{ userId: 'user_1', status: 'TODO' }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('task.api', () => {
  it('getSpaceTasks fetches and unwraps tasks list', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.TASKS('space_1'), ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('status')).toBe('TODO');
        return HttpResponse.json({
          message: 'Tasks fetched',
          tasks: [mockTask],
        });
      }),
    );

    const tasks = await getSpaceTasks('space_1', { status: 'TODO' });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?._id).toBe('task_100');
    expect(tasks[0]?.title).toBe('Write unit tests');
  });

  it('getTaskById returns single task by ID', async () => {
    server.use(
      http.get(API_ENDPOINTS.TASKS.BY_ID('task_100'), () => {
        return HttpResponse.json({
          message: 'Task details',
          task: mockTask,
        });
      }),
    );

    const task = await getTaskById('task_100');
    expect(task._id).toBe('task_100');
    expect(task.priority).toBe('HIGH');
  });

  it('createTask posts task data and returns created task', async () => {
    server.use(
      http.post(API_ENDPOINTS.TASKS.CREATE, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            message: 'Task created',
            task: { ...mockTask, title: body.title, _id: 'task_new' },
          },
          { status: 201 },
        );
      }),
    );

    const created = await createTask({
      spaceId: 'space_1',
      title: 'New API Task',
      deadline: '2026-12-31T00:00:00.000Z',
    });

    expect(created._id).toBe('task_new');
    expect(created.title).toBe('New API Task');
  });

  it('updateTask patches task and returns updated task', async () => {
    server.use(
      http.patch(API_ENDPOINTS.TASKS.UPDATE('task_100'), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          message: 'Task updated',
          task: { ...mockTask, ...body },
        });
      }),
    );

    const updated = await updateTask('task_100', { progressStatus: 'IN_PROGRESS' });
    expect(updated.progressStatus).toBe('IN_PROGRESS');
  });

  it('deleteTask removes task and returns deleted task', async () => {
    server.use(
      http.delete(API_ENDPOINTS.TASKS.DELETE('task_100'), () => {
        return HttpResponse.json({
          message: 'Task deleted',
          task: { ...mockTask, lifecycleStatus: 'DELETED' },
        });
      }),
    );

    const deleted = await deleteTask('task_100');
    expect(deleted.lifecycleStatus).toBe('DELETED');
  });

  it('addAssignee adds member to task', async () => {
    server.use(
      http.post(API_ENDPOINTS.TASKS.ADD_ASSIGNEE('task_100'), () => {
        return HttpResponse.json({
          message: 'Assignee added',
          task: {
            ...mockTask,
            assignees: [...mockTask.assignees, { userId: 'user_2', status: 'TODO' }],
          },
        });
      }),
    );

    const res = await addAssignee('task_100', 'user_2');
    expect(res.assignees).toHaveLength(2);
  });

  it('removeAssignee deletes member from task', async () => {
    server.use(
      http.delete(API_ENDPOINTS.TASKS.REMOVE_ASSIGNEE('task_100', 'user_1'), () => {
        return HttpResponse.json({
          message: 'Assignee removed',
          task: { ...mockTask, assignees: [] },
        });
      }),
    );

    const res = await removeAssignee('task_100', 'user_1');
    expect(res.assignees).toHaveLength(0);
  });

  it('updateMyAssigneeStatus updates self status', async () => {
    server.use(
      http.patch(API_ENDPOINTS.TASKS.UPDATE_MY_STATUS('task_100'), () => {
        return HttpResponse.json({
          message: 'Status updated',
          task: {
            ...mockTask,
            assignees: [{ userId: 'user_1', status: 'DONE' }],
          },
        });
      }),
    );

    const res = await updateMyAssigneeStatus('task_100', 'DONE');
    expect(res.assignees[0]?.status).toBe('DONE');
  });
});
