import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, Badge, Button, ErrorState, Skeleton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { ApiError } from '@/types';
import { ThemeScope } from '../components/ThemeScope';
import { SpaceThemeDot } from '../components/SpaceThemeDot';
import { SpaceIdBadge } from '../components/SpaceIdBadge';
import { JoinSpaceButton } from '../components/JoinSpaceButton';
import { usePublicSpace } from '../hooks/usePublicSpace';
import { useSpaces } from '../hooks/useSpaces';
import { getSpaceKindConfig } from '../utils/spaceKindConfig';
import { useAuth } from '@/app/providers/useAuth';
import { useTheme } from '@/app/providers/useTheme';

export const PublicSpacePage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const space = usePublicSpace(id);
  const { isAuthenticated } = useAuth();
  const { effectiveMode } = useTheme();
  const spaces = useSpaces(isAuthenticated);
  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => {
    if (!space.data) return;
    const description = space.data.description;
    document.title = `${space.data.name} | SyncSpace`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    const metaTags: Array<[string, string]> = [
      ['og:title', space.data.name],
      ['og:description', description],
      ['og:type', 'website'],
      ['og:url', window.location.href],
    ];
    for (const [property, content] of metaTags) {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    }
  }, [space.data]);

  if (space.isLoading) return <Skeleton className="mx-auto mt-10 h-96 max-w-5xl" />;
  if (space.isError || !space.data) {
    return (
      <ErrorState
        title={
          space.error instanceof ApiError && space.error.status === 404
            ? "This space is private or doesn't exist"
            : 'Space unavailable'
        }
        message={
          space.error instanceof ApiError && space.error.status === 404
            ? undefined
            : 'This public space could not be loaded.'
        }
        onRetry={() => void space.refetch()}
      />
    );
  }

  const kind = getSpaceKindConfig(space.data.kind);
  const stats = [
    ['Contributors', space.data.contributorStats.totalContributors],
    [kind.wording.taskNoun, space.data.contributorStats.totalTasks],
    ['Completed', space.data.contributorStats.completedTasks],
  ];

  return (
    <ThemeScope
      theme={space.data.theme.preset}
      mode={effectiveMode}
      className="min-h-screen text-text"
    >
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="border-border/80 bg-surface/90 rounded-card border p-6 shadow-card backdrop-blur-sm sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <SpaceThemeDot theme={space.data.theme} size="md" />
            <Badge variant="accent">{kind.label}</Badge>
            <Badge variant="outline">{space.data.visibility.toLowerCase()}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-text">
              {space.data.name}
            </h1>
            <SpaceIdBadge spaceId={space.data._id} size="md" />
          </div>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-muted">
            {space.data.description || kind.tagline}
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm text-text-muted">
            Owned by{' '}
            <Link
              className="inline-flex items-center gap-2 font-semibold text-accent hover:underline"
              to={ROUTES.profile(space.data.owner._id)}
            >
              <Avatar name={space.data.owner.name} size="xs" />
              {space.data.owner.name}
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-muted">
            <time dateTime={space.data.createdAt}>
              Created{' '}
              {new Date(space.data.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
              })}
            </time>
            {space.data.memberCount !== undefined && (
              <span>· {space.data.memberCount} members</span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {space.data.status === 'Inactive' ? (
              <p className="bg-warning/10 rounded-button px-4 py-2 text-sm text-text">
                This space is inactive and read-only.
              </p>
            ) : (
              <JoinSpaceButton
                spaceId={space.data._id}
                joinPolicy={space.data.joinPolicy}
                isMember={spaces.data?.some((item) => item._id === space.data._id)}
              />
            )}
            <div className="relative">
              <Button
                variant="outline"
                aria-expanded={shareOpen}
                onClick={() => setShareOpen((open) => !open)}
              >
                Share
              </Button>
              {shareOpen && (
                <div className="absolute left-0 top-full z-10 mt-2 w-52 rounded-card border border-border bg-surface p-3 shadow-elevated">
                  <button
                    type="button"
                    className="w-full rounded-button px-3 py-2 text-left text-sm text-text hover:bg-surface-hover"
                    onClick={() => {
                      void navigator.clipboard.writeText(window.location.href);
                      toast.success('Space link copied');
                      setShareOpen(false);
                    }}
                  >
                    Copy link
                  </button>
                  {typeof navigator.share === 'function' && (
                    <button
                      type="button"
                      className="w-full rounded-button px-3 py-2 text-left text-sm text-text hover:bg-surface-hover"
                      onClick={() => {
                        void navigator
                          .share({ title: space.data.name, url: window.location.href })
                          .catch(() => undefined);
                        setShareOpen(false);
                      }}
                    >
                      Share from device
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stat Cards */}
        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="border-border/80 bg-surface/90 rounded-card border p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-elevated"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {label}
              </p>
              <p className="mt-2 font-heading text-3xl font-bold text-text">{value}</p>
            </div>
          ))}
        </section>

        {/* Overall Completion Card */}
        <section
          aria-label="Overall completion"
          className="border-border/80 bg-surface/90 rounded-card border p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-text">Overall completion</h2>
            <span className="text-xs font-semibold text-text-muted">
              <span className="font-bold text-accent">
                {space.data.contributorStats.completedTasks}
              </span>{' '}
              / {space.data.contributorStats.totalTasks}
            </span>
          </div>
          <div className="border-border/50 mt-4 h-3 overflow-hidden rounded-full border bg-surface-hover">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{
                width: `${space.data.contributorStats.totalTasks ? (space.data.contributorStats.completedTasks / space.data.contributorStats.totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </section>

        {/* Contributors List */}
        {space.data.visibility === 'PUBLIC' &&
          (space.data.contributors?.length ? (
            <section className="space-y-3">
              <h2 className="font-heading text-2xl font-bold text-text">Who did the work</h2>
              <div className="space-y-2.5">
                {space.data.contributors.map((contributor, index) => (
                  <div
                    key={contributor.userId}
                    className="border-border/80 bg-surface/90 hover:bg-surface-hover/80 flex items-center gap-3 rounded-card border p-4 shadow-card transition-all hover:border-accent"
                  >
                    <span className="w-6 text-center text-xs font-bold text-text-muted">
                      #{index + 1}
                    </span>
                    <Avatar name={contributor.name} size="sm" />
                    <Link
                      className="min-w-0 flex-1 truncate font-medium text-text hover:text-accent hover:underline"
                      to={ROUTES.profile(contributor.userId)}
                    >
                      {contributor.name}
                    </Link>
                    <span className="text-xs font-medium text-text-muted">
                      {contributor.tasksCompleted} tasks · {contributor.share}%
                    </span>
                    <div className="border-border/50 hidden h-2 w-28 overflow-hidden rounded-full border bg-surface-hover sm:block">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${Math.min(100, contributor.share)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className="border-border/80 bg-surface/90 rounded-card border p-6 text-center text-sm text-text-muted shadow-card">
              Contributor details aren't shared yet.
            </div>
          ))}
      </div>
    </ThemeScope>
  );
};
