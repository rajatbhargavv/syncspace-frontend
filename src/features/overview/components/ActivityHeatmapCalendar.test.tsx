import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { ActivityHeatmapCalendar } from './ActivityHeatmapCalendar';
import type { SpaceSummary } from '@/features/spaces';

const mockSpace: SpaceSummary = {
  _id: 'space-1',
  name: 'Dev Space',
  description: 'Dev space description',
  kind: 'STUDIO',
  theme: { preset: 'HEARTH', mode: 'light' },
  visibility: 'PRIVATE',
  joinPolicy: 'INVITE_ONLY',
  status: 'Active',
  memberCount: 2,
  owner: 'user-1',
  ownerId: 'user-1',
  myRole: 'OWNER',
  spaceType: 'Personal',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ActivityHeatmapCalendar', () => {
  it('renders heatmap streak metrics and view switchers', () => {
    renderWithProviders(
      <ActivityHeatmapCalendar
        spaces={[mockSpace]}
        activityData={{
          overallCompletedMap: new Map(),
          overallAssignedMap: new Map(),
          bySpaceMap: new Map(),
          currentStreak: 5,
          longestStreak: 12,
          totalCompleted: 42,
        }}
      />,
    );

    expect(screen.getByText('Productivity Heatmap & Activity Calendar')).toBeInTheDocument();
    expect(screen.getByText('5 Days')).toBeInTheDocument();
    expect(screen.getByText('12 Days')).toBeInTheDocument();
    expect(screen.getByText('42 Tasks')).toBeInTheDocument();
    expect(screen.getByText('Continuous (24 Wks)')).toBeInTheDocument();
    expect(screen.getByText('Month Matrix')).toBeInTheDocument();
  });

  it('switches between view modes', () => {
    renderWithProviders(
      <ActivityHeatmapCalendar
        spaces={[mockSpace]}
        activityData={{
          overallCompletedMap: new Map(),
          overallAssignedMap: new Map(),
          bySpaceMap: new Map(),
          currentStreak: 0,
          longestStreak: 0,
          totalCompleted: 0,
        }}
      />,
    );

    fireEvent.click(screen.getByText('Month Matrix'));
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });
});
