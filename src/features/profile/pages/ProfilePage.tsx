import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  NotchCard,
  Skeleton,
} from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/app/providers/useAuth';
import { useTheme } from '@/app/providers/useTheme';
import { ApiError } from '@/types';
import { useUserProfile } from '../hooks/useUserProfile';
import type { ProfileSpace } from '../types/profile.types';
import {
  getSpaceKindConfig,
  SpaceIdBadge,
  SpaceThemeDot,
  ThemeScope,
  useSpaces,
} from '@/features/spaces';
import { useEnrichedProfileSpace } from '../hooks/useEnrichedProfileSpace';

export const ProfilePage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const profile = useUserProfile(id);
  const isSelf = Boolean(user && user._id === id);
  const mySpacesQuery = useSpaces(isSelf);
  const [filter, setFilter] = useState<'ALL' | 'OWNER' | 'MEMBER'>('ALL');
  useEffect(() => {
    if (profile.data) {
      document.title = `${profile.data.name} | SyncSpace`;
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', `${profile.data.name}'s public SyncSpace profile`);
    }
  }, [profile.data]);

  if (profile.isLoading) return <Skeleton className="mx-auto mt-10 h-96 max-w-5xl" />;
  if (profile.isError || !profile.data) {
    const notFound = profile.error instanceof ApiError && profile.error.status === 404;
    const unauthorized = profile.error instanceof ApiError && profile.error.status === 401;
    if (unauthorized) {
      return (
        <div className="mx-auto mt-10 max-w-md rounded-card border border-border bg-surface p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-text">Sign in to view this profile</h2>
          <p className="mt-2 text-sm text-text-muted">
            This profile requires an authenticated session.
          </p>
          <Link
            className="mt-5 inline-block text-sm font-semibold text-accent hover:underline"
            to={ROUTES.LOGIN}
            state={{ from: { pathname: window.location.pathname } }}
          >
            Sign in
          </Link>
        </div>
      );
    }
    return (
      <ErrorState
        title={
          notFound ? "This profile doesn't exist or was deactivated" : 'Unable to load profile'
        }
        message={notFound ? undefined : 'Please try again.'}
        onRetry={notFound ? undefined : () => void profile.refetch()}
      />
    );
  }

  const data = profile.data;
  const myActiveSpaces = (mySpacesQuery.data ?? []).filter((s) => s.status === 'Active');

  const spaces = data.spaces
    .filter((space) => filter === 'ALL' || space.role === filter)
    .sort(
      (a, b) =>
        Number(b.role === 'OWNER') - Number(a.role === 'OWNER') ||
        b.stats.tasksCompleted - a.stats.tasksCompleted,
    );
  const tasks =
    data.totalTasksCompleted ??
    data.spaces.reduce((sum, space) => sum + space.stats.tasksCompleted, 0);

  const publicOwned = data.spaces.filter((space) => space.role === 'OWNER').length;
  const publicJoined = Math.max(0, data.spaces.length - publicOwned);
  const publicTotal = data.publicSpacesCount ?? data.spaces.length;

  const owned =
    isSelf && mySpacesQuery.data
      ? myActiveSpaces.filter((space) => space.myRole === 'OWNER').length
      : publicOwned;
  const joined =
    isSelf && mySpacesQuery.data
      ? myActiveSpaces.filter((space) => space.myRole !== 'OWNER').length
      : publicJoined;
  const totalSpaces = isSelf && mySpacesQuery.data ? myActiveSpaces.length : publicTotal;

  const share = () => {
    const url = window.location.href;
    void navigator.clipboard.writeText(url);
    const shareApi = navigator as Navigator & {
      share?: (details: { title: string; url: string }) => Promise<void>;
    };
    if (typeof shareApi.share === 'function')
      void shareApi.share({ title: `${data.name}'s profile`, url }).catch(() => undefined);
    toast.success('Profile link copied');
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center gap-5">
        <Avatar name={data.name} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-4xl font-bold text-text">{data.name}</h1>
            {user?._id === id && <Badge variant="accent">This is you</Badge>}
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Joined{' '}
            {new Date(data.joinedAt).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          {user?._id === id && (
            <Button onClick={() => (window.location.href = ROUTES.settings)}>Edit profile</Button>
          )}
          <Button variant="outline" onClick={share}>
            Share
          </Button>
        </div>
      </header>
      <section className="grid gap-3 sm:grid-cols-4">
        {[
          {
            label: isSelf ? 'Total spaces' : 'Public spaces',
            value: totalSpaces,
            subtext: isSelf ? `${publicTotal} public` : undefined,
          },
          {
            label: 'Tasks completed',
            value: tasks,
          },
          {
            label: isSelf ? 'Spaces owned' : 'Public spaces owned',
            value: owned,
            subtext: isSelf ? `${publicOwned} public` : undefined,
          },
          {
            label: isSelf ? 'Spaces joined' : 'Public spaces joined',
            value: joined,
            subtext: isSelf ? `${publicJoined} public` : undefined,
          },
        ].map(({ label, value, subtext }) => (
          <div key={label} className="rounded-card border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold text-text">{value}</p>
            {subtext && <p className="mt-1 text-xs text-text-muted">{subtext}</p>}
          </div>
        ))}
      </section>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text">Public spaces</h2>
            {isSelf && myActiveSpaces.length > data.spaces.length && (
              <p className="mt-1 text-xs text-text-muted">
                Only your public spaces are shown here to other members. Your{' '}
                {myActiveSpaces.length - data.spaces.length} private{' '}
                {myActiveSpaces.length - data.spaces.length === 1 ? 'space is' : 'spaces are'}{' '}
                accessible from your dashboard.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {(['ALL', 'OWNER', 'MEMBER'] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={filter === value ? 'primary' : 'outline'}
                onClick={() => setFilter(value)}
              >
                {value === 'ALL' ? 'All' : value === 'OWNER' ? 'Owned' : 'Joined'}
              </Button>
            ))}
          </div>
        </div>
        {spaces.length === 0 ? (
          <EmptyState
            title={`${data.name} has no public spaces yet.`}
            description={
              user?._id === id
                ? 'Make a space public from its settings to show it here.'
                : 'Public spaces will appear here when available.'
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {spaces.map((space, index) => (
              <ProfileSpaceCard key={space._id} space={space} shouldEnrich={index < 12} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

function ProfileSpaceCard({ space, shouldEnrich }: { space: ProfileSpace; shouldEnrich: boolean }) {
  const navigate = useNavigate();
  const { effectiveMode } = useTheme();
  const enriched = useEnrichedProfileSpace(space, shouldEnrich);
  const displaySpace = enriched.space;
  const kind = displaySpace.kind ? getSpaceKindConfig(displaySpace.kind) : undefined;

  return (
    <div ref={enriched.ref} className="h-full">
      <ThemeScope
        theme={displaySpace.theme?.preset ?? 'ORBIT'}
        mode={effectiveMode}
        className="h-full rounded-card"
      >
        <NotchCard
          variant="custom"
          className="h-full cursor-pointer p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-elevated"
          onClick={() => navigate(ROUTES.publicSpace(displaySpace._id))}
        >
          {/* Card Header & Body */}
          <div className="pr-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SpaceThemeDot theme={displaySpace.theme} />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {kind?.label ?? 'Public space'}
                </span>
              </div>
              <Badge variant={space.role === 'OWNER' ? 'accent' : 'outline'} size="sm">
                {space.role === 'OWNER' ? 'Owner' : 'Member'}
              </Badge>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <h3 className="truncate font-heading text-lg font-bold text-text transition-colors group-hover:text-accent">
                {displaySpace.name}
              </h3>
              <SpaceIdBadge spaceId={displaySpace._id} size="sm" />
            </div>

            <p className="mt-1 line-clamp-2 min-h-10 text-sm text-text-muted">
              {displaySpace.description || kind?.tagline || 'Public collaborative space'}
            </p>
          </div>

          {/* Card Footer & Stats */}
          <div className="border-border/60 mt-5 border-t pt-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-medium">
                {displaySpace.memberCount === undefined
                  ? 'Members unavailable'
                  : `${displaySpace.memberCount} member${displaySpace.memberCount === 1 ? '' : 's'}`}
              </span>
              <span className="font-medium">
                {displaySpace.stats.tasksCompleted} task
                {displaySpace.stats.tasksCompleted === 1 ? '' : 's'} completed
              </span>
            </div>

            <div className="border-border/50 mt-3 h-2 overflow-hidden rounded-full border bg-surface-hover">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${Math.min(100, displaySpace.stats.contributionShare)}%` }}
              />
            </div>

            <p className="mt-2 text-[11px] font-medium text-text-muted">
              Contributed {displaySpace.stats.contributionShare}% of finished work
            </p>
          </div>
        </NotchCard>
      </ThemeScope>
    </div>
  );
}
