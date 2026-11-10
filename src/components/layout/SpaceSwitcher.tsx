import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { SpaceThemeDot, useSpaces } from '@/features/spaces';
import { Skeleton } from '@/components/ui/Skeleton';

export const SpaceSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const spacesQuery = useSpaces();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const currentId = location.pathname.startsWith('/spaces/')
    ? location.pathname.split('/')[2]
    : undefined;
  const spaces = useMemo(
    () =>
      (spacesQuery.data ?? []).filter(
        (space) =>
          space.status === 'Active' && space.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, spacesQuery.data],
  );
  const currentSpace = spacesQuery.data?.find((space) => space._id === currentId);

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex max-w-[220px] items-center gap-2 rounded-button border border-border bg-surface px-3 py-2 text-left text-sm hover:bg-surface-hover"
      >
        {currentSpace && <SpaceThemeDot theme={currentSpace.theme} size="sm" />}
        <span className="truncate">{currentSpace?.name ?? 'Select a space'}</span>
        <span aria-hidden="true" className="text-text-muted">
          ⌄
        </span>
      </button>
      {isOpen && (
        <div
          role="listbox"
          className="z-dropdown absolute left-0 top-full mt-2 w-72 rounded-card border border-border bg-surface p-2 shadow-elevated"
        >
          <input
            aria-label="Search spaces"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search spaces"
            className="mb-2 w-full rounded-input border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
          {spacesQuery.isLoading && <Skeleton className="h-9 w-full" />}
          {!spacesQuery.isLoading && spaces.length === 0 && (
            <p className="px-2 py-3 text-xs text-text-muted">No spaces found.</p>
          )}
          {spaces.map((space) => (
            <button
              type="button"
              role="option"
              aria-selected={space._id === currentId}
              key={space._id}
              onClick={() => {
                navigate(ROUTES.space(space._id));
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-button px-2 py-2 text-left text-sm text-text hover:bg-surface-hover"
            >
              <SpaceThemeDot theme={space.theme} size="sm" />
              <span className="flex-1 truncate">{space.name}</span>
              <span className="text-xs text-text-muted">{space.memberCount}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
