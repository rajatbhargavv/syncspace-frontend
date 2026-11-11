import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';

export interface UpgradeCardProps {
  ownerCanUpgrade: boolean;
  from: string;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({ ownerCanUpgrade, from }) => (
  <div className="border-accent/40 w-full max-w-md rounded-card border bg-surface p-6 text-center shadow-elevated">
    <span className="text-xs font-semibold uppercase tracking-wider text-accent">Pro</span>
    <h2 className="mt-2 font-heading text-2xl font-bold text-text">
      {ownerCanUpgrade
        ? 'Unlock team performance insights'
        : 'Ask the space owner to upgrade to Pro'}
    </h2>
    <ul className="mt-5 space-y-2 text-left text-sm text-text-muted">
      <li>✓ Completion trends over time</li>
      <li>✓ See who did the work</li>
      <li>✓ Balance active workload</li>
      <li>✓ Export performance reports</li>
    </ul>
    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
      {ownerCanUpgrade && (
        <Link to={`${ROUTES.upgrade}?from=${encodeURIComponent(from)}`}>
          <Button className="w-full sm:w-auto">Upgrade to Pro</Button>
        </Link>
      )}
      <Link to={ROUTES.space(from.split('/')[2] ?? '')}>
        <Button variant="secondary" className="w-full sm:w-auto">
          Maybe later
        </Button>
      </Link>
    </div>
  </div>
);
