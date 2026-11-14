import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { TodayAgenda } from './TodayAgenda';
import type { TaskWithSpace } from '@/features/tasks/hooks/useCrossSpaceTasks';

const mockSpace = {
  _id: 'space-1',
  name: 'Team Alpha',
  description: 'Demo space description',
  kind: 'BUILDERS_CIRCLE' as const,
  theme: { preset: 'NEON_GRID' as const, mode: 'dark' as const },
  visibility: 'PRIVATE' as const,
  joinPolicy: 'INVITE_ONLY' as const,
  status: 'Active' as const,
  memberCount: 3,
  owner: 'user-1',
  ownerId: 'user-1',
  myRole: 'OWNER' as const,
  spaceType: 'Shared' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockTasks: TaskWithSpace[] = [
  {
    space: mockSpace,
    task: {
      _id: 'task-1',
      spaceId: 'space-1',
      createdBy: 'user-1',
      title: 'Fix inventory button bug',
      tags: ['inventory', 'frontend'],
      priority: 'HIGH',
      deadline: new Date().toISOString(),
      progressStatus: 'TODO',
      lifecycleStatus: 'ACTIVE',
      assignees: [],
      createdAt: '2026-11-14T00:00:00Z',
      updatedAt: '2026-11-14T00:00:00Z',
    },
  },
  {
    space: mockSpace,
    task: {
      _id: 'task-2',
      spaceId: 'space-1',
      createdBy: 'user-1',
      title: 'Update checkout UI flow',
      tags: ['ui'],
      priority: 'MEDIUM',
      deadline: new Date().toISOString(),
      progressStatus: 'IN_PROGRESS',
      lifecycleStatus: 'ACTIVE',
      assignees: [],
      createdAt: '2026-11-14T00:00:00Z',
      updatedAt: '2026-11-14T00:00:00Z',
    },
  },
];

describe('TodayAgenda', () => {
  it('renders today agenda with task titles, tags, and space badge', () => {
    renderWithProviders(
      <TodayAgenda
        agenda={{
          overdue: [],
          dueToday: [mockTasks[0]!],
          inProgress: [mockTasks[1]!],
          completedToday: [],
          allActionable: mockTasks,
        }}
      />,
    );

    expect(screen.getByText("Today's Agenda & Cross-Space Tasks")).toBeInTheDocument();
    expect(screen.getByText('Fix inventory button bug')).toBeInTheDocument();
    expect(screen.getByText('#inventory')).toBeInTheDocument();
    expect(screen.getByText('Update checkout UI flow')).toBeInTheDocument();
    expect(screen.getByText('#ui')).toBeInTheDocument();
    expect(screen.getAllByText('Team Alpha').length).toBeGreaterThan(0);
  });

  it('filters by status tabs', () => {
    renderWithProviders(
      <TodayAgenda
        agenda={{
          overdue: [],
          dueToday: [mockTasks[0]!],
          inProgress: [mockTasks[1]!],
          completedToday: [],
          allActionable: mockTasks,
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^In Progress/i }));
    expect(screen.getByText('Update checkout UI flow')).toBeInTheDocument();
    expect(screen.queryByText('Fix inventory button bug')).not.toBeInTheDocument();
  });
});
