import React, { useContext, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContext } from '@/app/providers/AuthContext';
import { Button, EmptyState, ErrorState, Skeleton, Tabs, type TabItem } from '@/components/ui';
import { ApiError } from '@/types';
import { ROUTES } from '@/config/routes';
import { useSpace } from '../hooks/useSpace';
import { useSpaceTheme } from '../hooks/useSpaceTheme';
import { usePublicSpace } from '../hooks/usePublicSpace';
import { useSpaceSocket } from '../hooks/useSpaceSocket';
import {
  useSpaceMembers,
  useLeaveSpace,
  useRemoveMember,
  MemberCard,
  PendingRequests,
} from '@/features/members';
import { SpaceHeader } from '../components/SpaceHeader';
import { NotMemberScreen } from '../components/NotMemberScreen';
import { SpaceSettingsDialog } from '../components/SpaceSettingsDialog';
import { SpaceInvitePanel } from '../components/SpaceInvitePanel';
import { getSpaceKindConfig } from '../utils/spaceKindConfig';
import {
  useSpaceView,
  type SpaceViewType,
  BoardView,
  ListView,
  CalendarView,
  WorkloadStrip,
  TaskFilterBar,
  TaskDrawer,
  CreateTaskDialog,
} from '@/features/tasks';

const VIEW_TABS: TabItem[] = [
  {
    id: 'board',
    label: 'Board',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
        />
      </svg>
    ),
  },
  {
    id: 'list',
    label: 'List',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export const SpaceOverviewPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  useSpaceSocket(id);
  const navigate = useNavigate();
  const space = useSpace(id);
  const publicSpace = usePublicSpace(id);
  const members = useSpaceMembers(id);
  const leave = useLeaveSpace();
  const remove = useRemoveMember();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const { view, setView } = useSpaceView(id);

  const visibleMembers = useMemo(
    () =>
      (members.data ?? [])
        .filter((member) => member.status !== 'PENDING')
        .sort((a, b) => Number(b.role === 'OWNER') - Number(a.role === 'OWNER')),
    [members.data],
  );

  useSpaceTheme(space.data);

  if (space.isLoading) return <Skeleton className="h-96" />;
  if (space.error instanceof ApiError && space.error.isNotFound) {
    return (
      <EmptyState
        title="Space not found"
        description="This space may have been deactivated or removed."
      />
    );
  }
  if (space.error instanceof ApiError && space.error.isForbidden) {
    if (publicSpace.isLoading) return <Skeleton className="h-72" />;
    if (publicSpace.isError || !publicSpace.data) {
      return (
        <ErrorState
          message="We could not load this space."
          onRetry={() => void publicSpace.refetch()}
        />
      );
    }
    return <NotMemberScreen space={publicSpace.data} />;
  }
  if (space.isError || !space.data) {
    return (
      <ErrorState
        message={space.error instanceof Error ? space.error.message : undefined}
        onRetry={() => void space.refetch()}
      />
    );
  }

  const currentSpace = space.data;
  const isOwner = (currentSpace.ownerId ?? currentSpace.owner) === user?._id;
  const canInvite = Boolean(
    isOwner ||
    (currentSpace.invitePermission === 'ALL_MEMBERS' &&
      members.data?.some(
        (member) => member.userId._id === user?._id && member.status === 'ACTIVE',
      )),
  );
  const kind = getSpaceKindConfig(currentSpace.kind);
  const isInactive = currentSpace.status === 'Inactive';

  const handleLeave = () => {
    if (!window.confirm(`Leave ${currentSpace.name}?`)) return;
    leave.mutate(currentSpace._id, {
      onSuccess: () => {
        toast.success('You left the space');
        navigate(ROUTES.spaces);
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : 'Unable to leave this space'),
    });
  };

  const handleRemove = (userId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from ${currentSpace.name}?`)) return;
    remove.mutate(
      { spaceId: currentSpace._id, userId },
      {
        onSuccess: () => toast.success(`${name} was removed from the space`),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : 'Unable to remove member'),
      },
    );
  };

  return (
    <div className="space-y-8">
      <SpaceHeader
        space={currentSpace}
        members={visibleMembers}
        isOwner={isOwner}
        onLeave={handleLeave}
        onSettings={() => setSettingsOpen(true)}
      />
      {isOwner && (
        <PendingRequests spaceId={currentSpace._id} joinPolicy={currentSpace.joinPolicy} />
      )}

      {isInactive && (
        <div
          role="alert"
          className="border-warning/30 bg-warning/10 rounded-input border p-4 text-sm font-medium text-warning"
        >
          This space is inactive and read-only.
        </div>
      )}

      {/* Workload strip */}
      <WorkloadStrip spaceId={currentSpace._id} />

      {/* Workspace Toolbar */}
      <section aria-label="Task views and controls" className="space-y-4">
        <div className="sticky -top-4 z-20 -mx-4 bg-bg px-4 pb-2 pt-4 sm:-top-6 sm:-mx-6 sm:px-6 sm:pt-6 md:-top-8 md:-mx-8 md:px-8 md:pt-8">
          <div className="border-border/80 rounded-card border bg-surface p-3 shadow-card sm:p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex shrink-0">
                <Tabs
                  tabs={VIEW_TABS}
                  activeTab={view}
                  onChange={(tabId) => setView(tabId as SpaceViewType)}
                  variant="pills"
                />
              </div>
              <Link
                to={ROUTES.spaceActivity(currentSpace._id)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text"
              >
                Activity{' '}
                <span aria-label="Pro feature" title="Pro feature">
                  🔒
                </span>
              </Link>

              <div className="flex-1 lg:max-w-3xl">
                <TaskFilterBar
                  spaceId={currentSpace._id}
                  action={
                    !isInactive ? (
                      <Button
                        size="sm"
                        onClick={() => setCreateTaskOpen(true)}
                        className="shrink-0 gap-1.5 shadow-sm"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span>New {kind.wording.taskNounSingular.toLowerCase()}</span>
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active View Component */}
        <main aria-label={`${kind.wording.taskNoun} workspace`} className="mt-2">
          {view === 'board' && <BoardView spaceId={currentSpace._id} />}
          {view === 'list' && <ListView spaceId={currentSpace._id} />}
          {view === 'calendar' && <CalendarView spaceId={currentSpace._id} />}
        </main>
      </section>

      {/* Space Members Section */}
      <SpaceInvitePanel spaceId={currentSpace._id} canInvite={canInvite} />
      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="font-heading text-xl font-semibold text-text">
          {kind.wording.memberNoun}
        </h2>
        <p className="mt-1 text-sm text-text-muted">People sharing this space.</p>
        <div className="mt-4">
          {members.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
          ) : members.isError ? (
            <ErrorState message="Unable to load members." onRetry={() => void members.refetch()} />
          ) : visibleMembers.length === 0 ? (
            <EmptyState
              title="No active members"
              description="Members will appear here when they join."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleMembers.map((member) => (
                <MemberCard
                  key={member.userId._id}
                  member={member}
                  onRemove={
                    isOwner && member.role !== 'OWNER'
                      ? () => handleRemove(member.userId._id, member.userId.name)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Task Drawer (URL-driven via ?task=) */}
      <TaskDrawer spaceId={currentSpace._id} />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        spaceId={currentSpace._id}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
      />

      {/* Settings Dialog */}
      <SpaceSettingsDialog
        space={currentSpace}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
