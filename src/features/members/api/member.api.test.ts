import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import { getSpaceMembers, joinSpace, leaveSpace, removeMember } from './member.api';

const member = {
  userId: { _id: 'user_1', name: 'Ada Lovelace' },
  role: 'MEMBER' as const,
  status: 'ACTIVE' as const,
  joinedAt: '2026-01-02T00:00:00.000Z',
};

describe('member.api', () => {
  it('gets members from the response envelope', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.MEMBERS('space_1'), () =>
        HttpResponse.json({ members: [member] }),
      ),
    );

    await expect(getSpaceMembers('space_1')).resolves.toEqual([member]);
  });

  it('joins a space and unwraps the member', async () => {
    server.use(
      http.post(API_ENDPOINTS.SPACES.JOIN('space_1'), () =>
        HttpResponse.json({ member }, { status: 201 }),
      ),
    );

    await expect(joinSpace('space_1')).resolves.toEqual(member);
  });

  it('posts leave and deletes a member', async () => {
    let left = false;
    let removed = false;
    server.use(
      http.post(API_ENDPOINTS.SPACES.LEAVE('space_1'), () => {
        left = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.delete(API_ENDPOINTS.SPACES.REMOVE_MEMBER('space_1', 'user_1'), () => {
        removed = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await leaveSpace('space_1');
    await removeMember('space_1', 'user_1');
    expect(left).toBe(true);
    expect(removed).toBe(true);
  });
});
