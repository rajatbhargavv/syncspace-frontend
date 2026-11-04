import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '@/config/constants';

export const mockUser = {
  _id: 'user_12345',
  name: 'Jane Doe',
  email: 'jane@example.com',
  plan: 'FREE' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const handlers = [
  // GET /api/users/me
  http.get(API_ENDPOINTS.USERS.ME, () => {
    return HttpResponse.json({
      message: 'User fetched successfully',
      user: mockUser,
    });
  }),

  // POST /api/auth/login
  http.post(API_ENDPOINTS.AUTH.LOGIN, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email === 'invalid@example.com') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    return HttpResponse.json({
      message: 'Successfully logged in',
      accessToken: 'mock-access-token',
    });
  }),

  // POST /api/auth/register
  http.post(API_ENDPOINTS.AUTH.REGISTER, async ({ request }) => {
    const body = (await request.json()) as { name?: string; email?: string };

    if (body.email === 'existing@example.com') {
      return HttpResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    return HttpResponse.json(
      {
        message: 'Successfully created',
        user: { name: body.name ?? 'New User', email: body.email ?? 'new@example.com' },
      },
      { status: 201 },
    );
  }),

  // POST /api/auth/refresh
  http.post(API_ENDPOINTS.AUTH.REFRESH, () => {
    return HttpResponse.json({
      message: 'Token refreshed successfully',
      accessToken: 'new-mock-access-token',
    });
  }),

  // POST /api/auth/logout
  http.post(API_ENDPOINTS.AUTH.LOGOUT, () => {
    return HttpResponse.json({
      message: 'Logged out successfully',
    });
  }),
<<<<<<< HEAD
];
=======
];
>>>>>>> 7a42eac4da9d7d72067212ae06555f7d94377449
