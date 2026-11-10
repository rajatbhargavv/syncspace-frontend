import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { ApiError } from '@/lib/http/ApiError';
import { ROUTES } from '@/config/routes';
import { useSpace } from '../hooks/useSpace';
import { useSpaceTheme } from '../hooks/useSpaceTheme';
import { usePublicSpace } from '../hooks/usePublicSpace';
import { useSpaceMembers, useLeaveSpace, useRemoveMember, MemberCard } from '@/features/members';
import { SpaceHeader } from '../components/SpaceHeader';
import { NotMemberScreen } from '../components/NotMemberScreen';
import { SpaceSettingsDialog } from '../components/SpaceSettingsDialog';
import { getSpaceKindConfig } from '../utils/spaceKindConfig';

export const SpaceOverviewPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const space = useSpace(id);
  const publicSpace = usePublicSpace(id);
  const members = useSpaceMembers(id);
  const leave = useLeaveSpace();
  const remove = useRemoveMember();
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      <section>
        <h2 className="font-heading text-xl font-semibold text-text">{kind.wording.memberNoun}</h2>
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
      <section className="bg-surface/50 rounded-card border border-dashed border-border p-8 text-center">
        <h2 className="font-heading text-xl font-semibold text-text">
          {kind.wording.taskNoun} board
        </h2>
        <p className="mt-2 text-sm text-text-muted">Tasks and the board arrive in Phase 2.</p>
      </section>
      <SpaceSettingsDialog
        space={currentSpace}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
