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
  const isSearching = Boolean(search.trim());
  const discoverable = useDiscoverableSpaces(search, filter === 'discover' || isSearching);

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
        (space) =>
          !query || `${space.name} ${space.description} ${space._id}`.toLowerCase().includes(query),
      );
  }, [filter, search, spaces.data]);

  const discoverableSpaces = useMemo(() => discoverable.data ?? [], [discoverable.data]);

  const userSpaceIds = useMemo(() => new Set((spaces.data ?? []).map((s) => s._id)), [spaces.data]);

  const otherDiscoverableSpaces = useMemo(
    () => discoverableSpaces.filter((space) => !userSpaceIds.has(space._id)),
    [discoverableSpaces, userSpaceIds],
  );

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
          placeholder="Search by name, description, or ID..."
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
      ) : filter === 'owned' || filter === 'joined' ? (
        filteredSpaces.length === 0 ? (
          <EmptyState title="No matching spaces" description="Try another search or filter." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSpaces.map((space) => (
              <SpaceCard key={space._id} space={space} />
            ))}
          </div>
        )
      ) : !isSearching ? (
        filteredSpaces.length === 0 ? (
          <EmptyState
            title="No spaces yet"
            description="Create your first space to get started."
            actionLabel="Create space"
            onAction={() => navigate(ROUTES.spaceNew)}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSpaces.map((space) => (
              <SpaceCard key={space._id} space={space} />
            ))}
          </div>
        )
      ) : filteredSpaces.length === 0 && otherDiscoverableSpaces.length === 0 ? (
        <EmptyState
          title="No matching spaces"
          description={`No spaces found matching "${search.trim()}". Try searching by name, description, or Space ID.`}
        />
      ) : filteredSpaces.length === 0 && otherDiscoverableSpaces.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-text">
              Discoverable spaces matching "{search.trim()}"
            </h2>
            <span className="text-xs text-text-muted">
              {otherDiscoverableSpaces.length}{' '}
              {otherDiscoverableSpaces.length === 1 ? 'space' : 'spaces'} found
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherDiscoverableSpaces.map((space) => (
              <DiscoverableSpaceCard key={space._id} space={space} />
            ))}
          </div>
        </div>
      ) : filteredSpaces.length > 0 && otherDiscoverableSpaces.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSpaces.map((space) => (
            <SpaceCard key={space._id} space={space} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-text">Your spaces</h2>
              <span className="text-xs text-text-muted">{filteredSpaces.length} found</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSpaces.map((space) => (
                <SpaceCard key={space._id} space={space} />
              ))}
            </div>
          </section>
          <section className="border-border/80 space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-text">
                Other discoverable spaces
              </h2>
              <span className="text-xs text-text-muted">
                {otherDiscoverableSpaces.length} found
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {otherDiscoverableSpaces.map((space) => (
                <DiscoverableSpaceCard key={space._id} space={space} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
