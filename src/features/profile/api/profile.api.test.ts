import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import { getUserProfile } from './profile.api';

describe('profile.api', () => {
  it('unwraps the public profile response', async () => {
    server.use(
      http.get(API_ENDPOINTS.USERS.PROFILE('user_1'), () =>
        HttpResponse.json({
          profile: {
            name: 'Jane Doe',
            joinedAt: '2026-01-01T00:00:00.000Z',
            spaces: [],
          },
        }),
      ),
    );

    await expect(getUserProfile('user_1')).resolves.toMatchObject({ name: 'Jane Doe', spaces: [] });
  });
});
