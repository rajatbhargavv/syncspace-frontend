import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, NotchCard } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { getSpaceKindConfig } from '../utils/spaceKindConfig';
import type { DiscoverableSpace } from '../types/space.types';
import { SpaceThemeDot } from './SpaceThemeDot';

export const DiscoverableSpaceCard: React.FC<{ space: DiscoverableSpace }> = ({ space }) => {
  const navigate = useNavigate();
  const kind = getSpaceKindConfig(space.kind);
  const policyLabel = space.joinPolicy === 'OPEN' ? 'Open to join' : 'Request to join';

  return (
    <NotchCard variant="custom" className="min-h-0 p-5">
      <div className="flex items-center gap-2">
        <SpaceThemeDot theme={space.theme} />
        <span className="text-xs font-medium text-text-muted">{kind.label}</span>
      </div>
      <h2 className="mt-3 truncate font-heading text-lg font-semibold text-text">{space.name}</h2>
      <p className="mt-1 line-clamp-2 min-h-10 text-sm text-text-muted">
        {space.description || kind.tagline}
      </p>
      <div className="border-border/60 mt-5 flex items-center justify-between gap-2 border-t pt-3">
        <Badge variant="outline" size="sm">
          {policyLabel}
        </Badge>
        <Button size="sm" onClick={() => navigate(ROUTES.PUBLIC_SPACE(space._id))}>
          View space
        </Button>
      </div>
    </NotchCard>
  );
};
