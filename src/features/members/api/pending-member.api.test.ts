import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import { approveMember, getPendingMembers, rejectMember } from './pending-member.api';

const pendingMember = {
  userId: { _id: 'user_2', name: 'Grace Hopper' },
  role: 'MEMBER' as const,
  status: 'PENDING' as const,
  joinedAt: '2026-02-01T00:00:00.000Z',
};

describe('pending-member.api', () => {
  it('loads pending members using the status query', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.MEMBERS('space_1'), ({ request }) => {
        expect(new URL(request.url).searchParams.get('status')).toBe('PENDING');
        return HttpResponse.json({ members: [pendingMember] });
      }),
    );

    await expect(getPendingMembers('space_1')).resolves.toEqual([pendingMember]);
  });

  it('approves and rejects members', async () => {
    let approved = false;
    let rejected = false;
    server.use(
      http.post(API_ENDPOINTS.SPACES.APPROVE_MEMBER('space_1', 'user_2'), () => {
        approved = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(API_ENDPOINTS.SPACES.REJECT_MEMBER('space_1', 'user_2'), () => {
        rejected = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await approveMember('space_1', 'user_2');
    await rejectMember('space_1', 'user_2');
    expect(approved).toBe(true);
    expect(rejected).toBe(true);
  });
});
