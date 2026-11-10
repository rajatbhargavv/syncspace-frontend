import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, NotchCard } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { getSpaceKindConfig } from '../utils/spaceKindConfig';
import type { SpaceSummary } from '../types/space.types';
import { SpaceThemeDot } from './SpaceThemeDot';

export interface SpaceCardProps {
  space: SpaceSummary;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ space }) => {
  const navigate = useNavigate();
  const kind = getSpaceKindConfig(space.kind);

  return (
    <NotchCard
      variant="custom"
      className="min-h-0 cursor-pointer p-5"
      onClick={() => navigate(ROUTES.space(space._id))}
    >
      <div className="pr-10">
        <div className="flex items-center gap-2">
          <SpaceThemeDot theme={space.theme} />
          <span className="text-xs font-medium text-text-muted">{kind.label}</span>
        </div>
        <h2 className="mt-3 truncate font-heading text-lg font-semibold text-text">{space.name}</h2>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm text-text-muted">
          {space.description || kind.tagline}
        </p>
      </div>
      <div className="border-border/60 mt-5 flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-text-muted">
        <Badge variant={space.myRole === 'OWNER' ? 'accent' : 'default'} size="sm">
          {space.myRole === 'OWNER' ? 'Owner' : 'Joined'}
        </Badge>
        <span>{space.memberCount} members</span>
        <span aria-label={`${space.visibility.toLowerCase()} visibility`}>
          {space.visibility === 'PUBLIC'
            ? 'Public'
            : space.visibility === 'UNLISTED'
              ? 'Unlisted'
              : 'Private'}
        </span>
      </div>
    </NotchCard>
  );
};
