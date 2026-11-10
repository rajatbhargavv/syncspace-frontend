import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '@/test/test-utils';
import { Routes, Route } from 'react-router-dom';
import { SpaceOverviewPage } from './SpaceOverviewPage';
import type { Space } from '../types/space.types';

const mockActiveSpace: Space = {
  _id: 'space_1',
  name: 'Dev Squad Space',
  description: 'Team workspace',
  kind: 'BUILDERS_CIRCLE',
  theme: { preset: 'NEON_GRID', mode: 'dark' },
  visibility: 'PRIVATE',
  joinPolicy: 'INVITE_ONLY',
  status: 'Active',
  owner: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockInactiveSpace: Space = {
  ...mockActiveSpace,
  status: 'Inactive',
};

let currentMockSpace = mockActiveSpace;

vi.mock('../hooks/useSpace', () => ({
  useSpace: () => ({
    data: currentMockSpace,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../hooks/usePublicSpace', () => ({
  usePublicSpace: () => ({ data: undefined, isLoading: false, isError: false }),
}));

vi.mock('../hooks/useSpaceTheme', () => ({
  useSpaceTheme: vi.fn(),
}));

vi.mock('@/features/members', () => ({
  useSpaceMembers: () => ({
    data: [
      {
        userId: { _id: 'u1', name: 'Lead Dev' },
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useLeaveSpace: () => ({ mutate: vi.fn() }),
  useRemoveMember: () => ({ mutate: vi.fn() }),
  MemberCard: ({ member }: { member: { userId: { name: string } } }) => (
    <div data-testid="member-card">{member.userId.name}</div>
  ),
  PendingRequests: () => <div data-testid="pending-requests" />,
}));

describe('SpaceOverviewPage (Workspace Shell)', () => {
  it('renders workspace shell, view tabs, workload strip and default board view', () => {
    currentMockSpace = mockActiveSpace;

    renderWithProviders(
      <Routes>
        <Route path="/spaces/:id" element={<SpaceOverviewPage />} />
      </Routes>,
      { initialEntries: ['/spaces/space_1'] },
    );

    expect(screen.getByText('Dev Squad Space')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /board/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /list/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /calendar/i })).toBeInTheDocument();
    expect(screen.getByTestId('workload-strip')).toBeInTheDocument();
    expect(screen.getByTestId('board-view')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new ticket/i })).toBeInTheDocument();
  });

  it('switches views when clicking tabs', () => {
    currentMockSpace = mockActiveSpace;

    renderWithProviders(
      <Routes>
        <Route path="/spaces/:id" element={<SpaceOverviewPage />} />
      </Routes>,
      { initialEntries: ['/spaces/space_1'] },
    );

    fireEvent.click(screen.getByRole('tab', { name: /list/i }));
    expect(screen.getByTestId('list-view')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /calendar/i }));
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('shows read-only banner and hides create button for inactive space', () => {
    currentMockSpace = mockInactiveSpace;

    renderWithProviders(
      <Routes>
        <Route path="/spaces/:id" element={<SpaceOverviewPage />} />
      </Routes>,
      { initialEntries: ['/spaces/space_1'] },
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/inactive and read-only/i);
    expect(screen.queryByRole('button', { name: /new ticket/i })).not.toBeInTheDocument();
  });
});
