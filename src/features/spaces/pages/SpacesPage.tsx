import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, EmptyState, ErrorState, Input, Skeleton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SpaceCard } from '../components/SpaceCard';
import { DiscoverableSpaceCard } from '../components/DiscoverableSpaceCard';
import { useSpaces } from '../hooks/useSpaces';
import { useDiscoverableSpaces } from '../hooks/useDiscoverableSpaces';

export const SpacesPage: React.FC = () => {
  const navigate = useNavigate();
  const spaces = useSpaces();
  const [filter, setFilter] = useState<'all' | 'owned' | 'joined' | 'discover'>('all');
  const [search, setSearch] = useState('');
  const discoverable = useDiscoverableSpaces(search, filter === 'discover');

  const filteredSpaces = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (spaces.data ?? [])
      .filter((space) => space.status === 'Active')
      .filter(
        (space) =>
          filter === 'all' ||
          (filter === 'owned' ? space.myRole === 'OWNER' : space.myRole === 'MEMBER'),
      )
      .filter(
        (space) => !query || `${space.name} ${space.description}`.toLowerCase().includes(query),
      );
  }, [filter, search, spaces.data]);

  const discoverableSpaces = discoverable.data ?? [];

  if (spaces.isLoading || (filter === 'discover' && discoverable.isLoading)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Your Spaces" description="Your collaborative spaces." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-52" />
          ))}
        </div>
      </div>
    );
  }

  if (spaces.isError || (filter === 'discover' && discoverable.isError)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Your Spaces" />
        <ErrorState
          message={spaces.error instanceof Error ? spaces.error.message : undefined}
          onRetry={() => void spaces.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Spaces"
        description="Collaborative task spaces for your family, dev team, studio, or personal workflows."
        actions={<Button onClick={() => navigate(ROUTES.spaceNew)}>Create space</Button>}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter spaces">
          {(['all', 'owned', 'joined', 'discover'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? 'primary' : 'outline'}
              onClick={() => setFilter(value)}
            >
              {value === 'all'
                ? 'All'
                : value === 'owned'
                  ? 'Owned'
                  : value === 'joined'
                    ? 'Joined'
                    : 'Discover'}
            </Button>
          ))}
        </div>
        <Input
          aria-label="Search spaces"
          placeholder="Search spaces..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-xs"
        />
      </div>
      {filter === 'discover' ? (
        discoverableSpaces.length === 0 ? (
          <EmptyState
            title="No discoverable spaces"
            description="Try a different search. Public spaces must allow requests or open joining."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {discoverableSpaces.map((space) => (
              <DiscoverableSpaceCard key={space._id} space={space} />
            ))}
          </div>
        )
      ) : filteredSpaces.length === 0 ? (
        <EmptyState
          title={search || filter !== 'all' ? 'No matching spaces' : 'No spaces yet'}
          description={
            search || filter !== 'all'
              ? 'Try another search or filter.'
              : 'Create your first space to get started.'
          }
          actionLabel={!search && filter === 'all' ? 'Create space' : undefined}
          onAction={!search && filter === 'all' ? () => navigate(ROUTES.spaceNew) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSpaces.map((space) => (
            <SpaceCard key={space._id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
};
