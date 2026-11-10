import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, EmptyState, ErrorState, Skeleton, Tabs, type TabItem } from '@/components/ui';
import { ApiError } from '@/types';
import { ROUTES } from '@/config/routes';
import { useSpace } from '../hooks/useSpace';
import { useSpaceTheme } from '../hooks/useSpaceTheme';
import { usePublicSpace } from '../hooks/usePublicSpace';
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
  { id: 'board', label: 'Board' },
  { id: 'list', label: 'List' },
  { id: 'calendar', label: 'Calendar' },
];

export const SpaceOverviewPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
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
  const isOwner =
    currentSpace.owner === members.data?.find((member) => member.role === 'OWNER')?.userId._id;
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

      {isInactive && (
        <div
          role="alert"
          className="border-warning/30 bg-warning/10 rounded-input border p-4 text-sm font-medium text-warning"
        >
          This space is inactive and read-only.
        </div>
      )}

      {/* Workspace Toolbar */}
      <section aria-label="Task views and controls" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            tabs={VIEW_TABS}
            activeTab={view}
            onChange={(tabId) => setView(tabId as SpaceViewType)}
            variant="pills"
          />

          <div className="flex items-center gap-3">
            <TaskFilterBar spaceId={currentSpace._id} />
            {!isInactive && (
              <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
                New {kind.wording.taskNounSingular.toLowerCase()}
              </Button>
            )}
          </div>
        </div>

        {/* Workload strip */}
        <WorkloadStrip spaceId={currentSpace._id} />

        {/* Active View Component */}
        <main aria-label={`${kind.wording.taskNoun} workspace`}>
          {view === 'board' && <BoardView spaceId={currentSpace._id} />}
          {view === 'list' && <ListView spaceId={currentSpace._id} />}
          {view === 'calendar' && <CalendarView spaceId={currentSpace._id} />}
        </main>
      </section>

      {/* Pending Join Requests (Owner only) */}
      {isOwner && (
        <PendingRequests spaceId={currentSpace._id} joinPolicy={currentSpace.joinPolicy} />
      )}

      {/* Space Members Section */}
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
