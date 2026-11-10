import React from 'react';

export interface WorkloadStripProps {
  spaceId: string;
}

export const WorkloadStrip: React.FC<WorkloadStripProps> = ({ spaceId }) => {
  return (
    <div
      data-testid="workload-strip"
      aria-label="Workload distribution"
      className="rounded-card border border-border bg-surface p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Team Workload
      </p>
      <p className="mt-1 text-xs text-text-muted">Space: {spaceId}</p>
    </div>
  );
};
