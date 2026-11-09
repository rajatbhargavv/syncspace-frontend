import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import {
  getMySpaces,
  getSpaceById,
  getPublicSpace,
  createSpace,
  updateSpace,
  deactivateSpace,
} from './space.api';
import type { Space, SpaceSummary, PublicSpace } from '../types/space.types';

const mockSpace: Space = {
  _id: 'space_123',
  name: 'Dev Space',
  description: 'Main dev team space',
  kind: 'BUILDERS_CIRCLE',
  theme: { preset: 'NEON_GRID', mode: 'dark' },
  visibility: 'PRIVATE',
  joinPolicy: 'INVITE_ONLY',
  status: 'Active',
  owner: 'user_12345',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockSpaceSummary: SpaceSummary = {
  ...mockSpace,
  myRole: 'OWNER',
  memberCount: 5,
};

const mockPublicSpace: PublicSpace = {
  _id: 'space_123',
  name: 'Open Space',
  description: 'Public showcase',
  kind: 'STUDIO',
  theme: { preset: 'IVORY_INK', mode: 'light' },
  visibility: 'PUBLIC',
  joinPolicy: 'OPEN',
  status: 'Active',
  createdAt: '2026-01-01T00:00:00.000Z',
  owner: {
    _id: 'user_999',
    name: 'Alice Designer',
  },
  contributorStats: {
    totalContributors: 12,
    totalTasks: 45,
    completedTasks: 38,
  },
};

describe('space.api', () => {
  it('getMySpaces returns array of SpaceSummary unwrapping envelope', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.LIST, () => {
        return HttpResponse.json({
          message: 'Spaces fetched',
          spaces: [mockSpaceSummary],
        });
      }),
    );

    const spaces = await getMySpaces();
    expect(spaces).toHaveLength(1);
    expect(spaces[0]?._id).toBe('space_123');
    expect(spaces[0]?.myRole).toBe('OWNER');
    expect(spaces[0]?.memberCount).toBe(5);
  });

  it('getSpaceById returns single Space unwrapping envelope', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.BY_ID('space_123'), () => {
        return HttpResponse.json({
          message: 'Space details',
          space: mockSpace,
        });
      }),
    );

    const space = await getSpaceById('space_123');
    expect(space._id).toBe('space_123');
    expect(space.name).toBe('Dev Space');
    expect(space.kind).toBe('BUILDERS_CIRCLE');
  });

  it('getSpaceById throws ApiError when user is not a member (403)', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.BY_ID('forbidden_space'), () => {
        return HttpResponse.json(
          { message: 'You are not a member of this space' },
          { status: 403 },
        );
      }),
    );

    await expect(getSpaceById('forbidden_space')).rejects.toThrow(
      'You are not a member of this space',
    );
  });

  it('getPublicSpace returns public space metadata without auth', async () => {
    server.use(
      http.get(API_ENDPOINTS.SPACES.PUBLIC('space_123'), () => {
        return HttpResponse.json({
          message: 'Public space details',
          space: mockPublicSpace,
        });
      }),
    );

    const publicSpace = await getPublicSpace('space_123');
    expect(publicSpace._id).toBe('space_123');
    expect(publicSpace.owner.name).toBe('Alice Designer');
    expect(publicSpace.contributorStats.totalTasks).toBe(45);
  });

  it('createSpace posts payload and returns created Space', async () => {
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

    const created = await createSpace({
      name: 'New Custom Space',
      kind: 'CUSTOM',
      theme: { preset: 'ORBIT', mode: 'dark' },
      visibility: 'PRIVATE',
      joinPolicy: 'INVITE_ONLY',
    });

    expect(created.name).toBe('New Custom Space');
  });

  it('updateSpace puts changes and returns updated Space', async () => {
    server.use(
      http.put(API_ENDPOINTS.SPACES.UPDATE('space_123'), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          message: 'Space updated',
          space: { ...mockSpace, name: body.name },
        });
      }),
    );

    const updated = await updateSpace('space_123', {
      name: 'Renamed Space',
    });

    expect(updated.name).toBe('Renamed Space');
  });

  it('deactivateSpace patches space to inactive', async () => {
    server.use(
      http.patch(API_ENDPOINTS.SPACES.DEACTIVATE('space_123'), () => {
        return HttpResponse.json({
          message: 'Space deactivated',
          space: { ...mockSpace, status: 'Inactive' },
        });
      }),
    );

    const deactivated = await deactivateSpace('space_123');
    expect(deactivated.status).toBe('Inactive');
  });
});

