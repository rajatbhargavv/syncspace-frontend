import React from 'react';
import { EmptyState } from '@/components/ui';
import type { PublicSpace } from '../types/space.types';
import { JoinSpaceButton } from './JoinSpaceButton';

export interface NotMemberScreenProps {
  space: PublicSpace;
}

export const NotMemberScreen: React.FC<NotMemberScreenProps> = ({ space }) => (
  <div className="mx-auto max-w-xl py-12">
    <EmptyState
      title="You are not a member of this space"
      description="Join the space to see its members and work together."
    />
    <div className="mt-4 flex justify-center">
      <JoinSpaceButton spaceId={space._id} joinPolicy={space.joinPolicy} />
    </div>
  </div>
);
