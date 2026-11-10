import React from 'react';
import { useParams } from 'react-router-dom';
import { Badge, ErrorState, Skeleton } from '@/components/ui';
import { ThemeScope } from '../components/ThemeScope';
import { JoinSpaceButton } from '../components/JoinSpaceButton';
import { usePublicSpace } from '../hooks/usePublicSpace';
import { getSpaceKindConfig } from '../utils/spaceKindConfig';

export const PublicSpacePage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const space = usePublicSpace(id);

  if (space.isLoading) return <Skeleton className="mx-auto mt-10 h-96 max-w-5xl" />;
  if (space.isError || !space.data) {
    return (
      <ErrorState
        title="Space unavailable"
        message="This public space could not be loaded."
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
          <p className="mt-5 text-sm text-text-muted">
            Owned by <span className="font-semibold text-text">{space.data.owner.name}</span>
          </p>
          <div className="mt-6">
            <JoinSpaceButton spaceId={space.data._id} joinPolicy={space.data.joinPolicy} />
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
      </div>
    </ThemeScope>
  );
};
