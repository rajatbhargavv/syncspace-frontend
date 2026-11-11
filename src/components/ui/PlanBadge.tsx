import React from 'react';
import { Badge, type BadgeProps } from './Badge';

export interface PlanBadgeProps {
  plan: 'FREE' | 'PRO';
  size?: BadgeProps['size'];
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan, size = 'sm' }) => (
  <Badge variant={plan === 'PRO' ? 'accent' : 'outline'} size={size}>
    {plan}
  </Badge>
);
