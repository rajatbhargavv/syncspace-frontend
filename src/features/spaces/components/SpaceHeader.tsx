import React from 'react';
import { Badge, Avatar, Button } from '@/components/ui';
import { getSpaceKindConfig } from '../utils/spaceKindConfig';
import type { Space, SpaceSummary } from '../types/space.types';
import { SpaceThemeDot } from './SpaceThemeDot';

export interface SpaceHeaderProps {
  space: Space | SpaceSummary;
  members: Array<{ userId: { _id: string; name: string } }>;
  isOwner: boolean;
  onLeave: () => void;
  onSettings: () => void;
}

export const SpaceHeader: React.FC<SpaceHeaderProps> = ({
  space,
  members,
  isOwner,
  onLeave,
  onSettings,
}) => {
  const kind = getSpaceKindConfig(space.kind);
  return (
    <header className="border-border/60 border-b pb-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SpaceThemeDot theme={space.theme} size="lg" />
            <Badge variant="outline">{kind.label}</Badge>
            <Badge variant={space.visibility === 'PUBLIC' ? 'success' : 'default'}>
              {space.visibility.toLowerCase()}
            </Badge>
            <Badge variant="outline">
              {space.joinPolicy === 'INVITE_ONLY'
                ? 'Invite only'
                : space.joinPolicy === 'REQUEST'
                  ? 'Request to join'
                  : 'Open to join'}
            </Badge>
          </div>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-text">
            {space.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            {space.description || kind.tagline}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {isOwner ? (
            <Button variant="outline" onClick={onSettings}>
              Settings
            </Button>
          ) : (
            <Button variant="outline" onClick={onLeave}>
              Leave space
            </Button>
          )}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((member) => (
            <Avatar
              key={member.userId._id}
              name={member.userId.name}
              size="sm"
              className="ring-2 ring-bg"
            />
          ))}
        </div>
        <span className="text-sm text-text-muted">{members.length} members</span>
      </div>
    </header>
  );
};
