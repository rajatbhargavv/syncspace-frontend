import { describe, expect, it } from 'vitest';
import { http as mswHttp, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { http } from './client';
import { ApiError } from './ApiError';

describe('HTTP client', () => {
  it('makes GET request and returns data', async () => {
    const data = await http.get<{ message: string; user: { name: string } }>('/api/users/me');
    expect(data.user.name).toBe('Jane Doe');
  });

  it('throws ApiError with correct status and message on error', async () => {
    server.use(
      mswHttp.get('/api/test-error', () => {
        return HttpResponse.json({ message: 'Custom error occurred' }, { status: 400 });
      }),
    );

    try {
      await http.get('/api/test-error');
      expect.fail('Should have thrown an error');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.message).toBe('Custom error occurred');
    }
  });

  it('attempts single-flight refresh on 401', async () => {
    let callCount = 0;

    server.use(
      mswHttp.get('/api/test-auth', () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({ message: 'Success after refresh' }, { status: 200 });
      }),
    );

    const res = await http.get<{ message: string }>('/api/test-auth');
    expect(res.message).toBe('Success after refresh');
    expect(callCount).toBe(2);
  });
});
