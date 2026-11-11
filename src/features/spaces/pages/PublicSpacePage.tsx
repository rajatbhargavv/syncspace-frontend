import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, Badge, Button, ErrorState, Skeleton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { ApiError } from '@/types';
import { ThemeScope } from '../components/ThemeScope';
import { JoinSpaceButton } from '../components/JoinSpaceButton';
import { usePublicSpace } from '../hooks/usePublicSpace';
import { useSpaces } from '../hooks/useSpaces';
import { getSpaceKindConfig } from '../utils/spaceKindConfig';
import { useAuth } from '@/app/providers/useAuth';

export const PublicSpacePage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const space = usePublicSpace(id);
  const { isAuthenticated } = useAuth();
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
      mode={space.data.theme.mode}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="bg-surface/80 rounded-card border border-border p-6 shadow-card sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{kind.label}</Badge>
            <Badge variant="outline">{space.data.visibility.toLowerCase()}</Badge>
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-text">
            {space.data.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-muted">
            {space.data.description || kind.tagline}
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm text-text-muted">
            Owned by{' '}
            <Link
              className="inline-flex items-center gap-2 font-semibold text-accent"
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
            {space.data.memberCount !== undefined && <span>{space.data.memberCount} members</span>}
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
        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-card border border-border bg-surface p-5">
              <p className="text-sm text-text-muted">{label}</p>
              <p className="mt-2 font-heading text-3xl font-bold text-text">{value}</p>
            </div>
          ))}
        </section>
        <section className="rounded-card border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-text">Overall completion</h2>
            <span className="text-sm text-text-muted">
              {space.data.contributorStats.completedTasks} /{' '}
              {space.data.contributorStats.totalTasks}
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent"
              style={{
                width: `${space.data.contributorStats.totalTasks ? (space.data.contributorStats.completedTasks / space.data.contributorStats.totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </section>
        {space.data.visibility === 'PUBLIC' &&
          (space.data.contributors?.length ? (
            <section className="space-y-3">
              <h2 className="font-heading text-2xl font-bold text-text">Who did the work</h2>
              {space.data.contributors.map((contributor, index) => (
                <div
                  key={contributor.userId}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface p-4"
                >
                  <span className="w-6 text-sm text-text-muted">#{index + 1}</span>
                  <Avatar name={contributor.name} size="sm" />
                  <Link
                    className="min-w-0 flex-1 truncate font-medium text-text hover:text-accent"
                    to={ROUTES.profile(contributor.userId)}
                  >
                    {contributor.name}
                  </Link>
                  <span className="text-sm text-text-muted">
                    {contributor.tasksCompleted} tasks · {contributor.share}%
                  </span>
                  <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-border sm:block">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${Math.min(100, contributor.share)}%` }}
                    />
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <p className="rounded-card border border-border bg-surface p-5 text-sm text-text-muted">
              Contributor details aren't shared yet.
            </p>
          ))}
      </div>
    </ThemeScope>
  );
};
