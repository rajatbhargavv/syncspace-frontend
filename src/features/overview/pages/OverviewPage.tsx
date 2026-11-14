import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/app/providers/useAuth';
import { getSpaceKindConfig, SpaceThemeDot, useSpaces } from '@/features/spaces';
import { PushNotificationSoftPrompt } from '@/features/push';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { NotchCard } from '@/components/ui/NotchCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCrossSpaceTasks } from '@/features/tasks/hooks/useCrossSpaceTasks';
import { TodayAgenda } from '../components/TodayAgenda';
import { ActivityHeatmapCalendar } from '../components/ActivityHeatmapCalendar';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const spacesQuery = useSpaces();
  const spaces = spacesQuery.data?.filter((space) => space.status === 'Active') ?? [];

  const {
    spaces: activeCrossSpaces,
    agenda,
    activityData,
    isLoading: isCrossTasksLoading,
  } = useCrossSpaceTasks();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section>
        <p className="text-sm font-medium text-accent">Good to see you</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-text">
          Welcome back, {user?.name ?? 'there'}
        </h1>
        <p className="mt-2 text-text-muted">
          Here is your centralized agenda, cross-space task radar, and activity streak.
        </p>
      </section>

      <PushNotificationSoftPrompt />

      {/* Feature 11: Cross-Space Today's Agenda & Due Tasks */}
      <TodayAgenda agenda={agenda} isLoading={isCrossTasksLoading} />

      {/* Feature 10: LeetCode / GitHub style Productivity Heatmap Calendar */}
      <ActivityHeatmapCalendar
        spaces={activeCrossSpaces.length > 0 ? activeCrossSpaces : spaces}
        activityData={activityData}
        isLoading={isCrossTasksLoading}
      />

      {/* Spaces Summary */}
      <section aria-labelledby="spaces-summary">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="spaces-summary" className="font-heading text-xl font-bold text-text">
            Your spaces
          </h2>
          <Button size="sm" onClick={() => navigate(ROUTES.spaceNew)}>
            Create a space
          </Button>
        </div>

        {spacesQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-40 w-full" />
            ))}
          </div>
        )}

        {spacesQuery.isError && (
          <ErrorState
            message="We could not load your spaces."
            onRetry={() => void spacesQuery.refetch()}
          />
        )}

        {!spacesQuery.isLoading && !spacesQuery.isError && spaces.length === 0 && (
          <EmptyState
            title="No spaces yet"
            description="Create your first space to get started."
            actionLabel="Create a space"
            onAction={() => navigate(ROUTES.spaceNew)}
          />
        )}

        {!spacesQuery.isLoading && !spacesQuery.isError && spaces.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <NotchCard
                key={space._id}
                variant="custom"
                onClick={() => navigate(ROUTES.space(space._id))}
              >
                <div className="flex items-start gap-3 pr-8">
                  <SpaceThemeDot theme={space.theme} size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate font-heading font-bold text-text">{space.name}</h3>
                    <p className="mt-1 text-xs text-text-muted">
                      {getSpaceKindConfig(space.kind).label}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
                  <span>{space.memberCount} members</span>
                  <span>{space.myRole === 'OWNER' ? 'Owner' : 'Member'}</span>
                </div>
              </NotchCard>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="font-heading font-bold text-text">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate(ROUTES.spaceNew)}>
            Create a space
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.myTasks)}>
            View all assigned tasks
          </Button>
        </div>
      </section>
    </div>
  );
};
