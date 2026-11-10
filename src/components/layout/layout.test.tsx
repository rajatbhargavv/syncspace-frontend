import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/test/test-utils';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/AppLayout';
import { NotificationBell } from './NotificationBell';
import { Sidebar } from './Sidebar';
import { SpaceSwitcher } from './SpaceSwitcher';

const spaces = [
  {
    _id: 'space-1',
    name: 'Design studio',
    description: '',
    kind: 'STUDIO',
    theme: { preset: 'ORBIT', mode: 'dark' },
    visibility: 'PRIVATE',
    joinPolicy: 'INVITE_ONLY',
    status: 'Active',
    owner: 'user-1',
    createdAt: '',
    updatedAt: '',
    myRole: 'OWNER',
    memberCount: 4,
  },
] as const;

vi.mock('@/features/spaces', () => ({
  useSpaces: () => ({ data: spaces, isLoading: false, isError: false, refetch: vi.fn() }),
  SpaceThemeDot: () => <span data-testid="space-theme-dot" />,
}));

vi.mock('@/features/notifications', () => ({
  useUnreadCount: () => ({ data: 103 }),
  useNotifications: () => ({
    data: { pages: [{ notifications: [], hasMore: false }] },
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
  useMarkAllNotificationsRead: () => ({ mutate: vi.fn(), isPending: false }),
  useMarkNotificationRead: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/features/realtime', () => ({
  useRealtimeSync: vi.fn(),
}));

vi.mock('@/app/providers/useAuth', () => ({
  useAuth: () => ({ user: { _id: 'user-1', name: 'Rishabh' } }),
}));

vi.mock('@/features/auth', () => ({
  useLogout: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

describe('application shell layout', () => {
  it('renders active spaces in the sidebar', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByText('Design studio')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('navigates when a space is selected', () => {
    const Location = () => <span data-testid="location">{useLocation().pathname}</span>;
    render(
      <MemoryRouter>
        <>
          <SpaceSwitcher />
          <Location />
        </>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /select a space/i }));
    fireEvent.click(screen.getByRole('option', { name: /design studio/i }));
    expect(screen.getByTestId('location')).toHaveTextContent('/spaces/space-1');
  });

  it('caps the unread notification badge at 99+', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    );
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('opens the mobile navigation drawer', () => {
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByRole('dialog', { name: 'Mobile navigation' })).toBeInTheDocument();
  });
});
