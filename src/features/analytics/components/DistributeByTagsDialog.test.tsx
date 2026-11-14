import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { DistributeByTagsDialog } from './DistributeByTagsDialog';

vi.mock('@/features/members', () => ({
  useSpaceMembers: () => ({
    data: [
      {
        userId: { _id: 'user-1', name: 'Rajat' },
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: '2026-01-01',
      },
      {
        userId: { _id: 'user-2', name: 'Mishthi' },
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: '2026-01-01',
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/features/tasks/hooks/useSpaceTasks', () => ({
  useSpaceTasks: () => ({
    data: [
      {
        _id: 'task-1',
        title: 'Fix inventory module bug',
        tags: ['inventory'],
        lifecycleStatus: 'ACTIVE',
        progressStatus: 'TODO',
      },
      {
        _id: 'task-2',
        title: 'Design UI updates',
        tags: ['ui'],
        lifecycleStatus: 'ACTIVE',
        progressStatus: 'TODO',
      },
    ],
    isLoading: false,
  }),
}));

describe('DistributeByTagsDialog', () => {
  it('renders detected tags and member assignment dropdowns', () => {
    renderWithProviders(
      <DistributeByTagsDialog
        isOpen={true}
        onClose={vi.fn()}
        spaceId="space-1"
        spaceName="Demo Space"
      />,
    );

    expect(screen.getByText('Distribute Tasks by Tags')).toBeInTheDocument();
    expect(screen.getAllByText('#inventory').length).toBeGreaterThan(0);
    expect(screen.getAllByText('#ui').length).toBeGreaterThan(0);
    expect(screen.getByText('Distribute Tasks')).toBeInTheDocument();
  });
});
