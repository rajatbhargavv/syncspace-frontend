import React from 'react';

export interface ListViewProps {
  spaceId: string;
}

export const ListView: React.FC<ListViewProps> = ({ spaceId }) => {
  return (
    <div
      data-testid="list-view"
      aria-label="List view"
      className="flex min-h-[320px] items-center justify-center rounded-card border border-dashed border-border p-8 text-center"
    >
      <div>
        <p className="font-heading font-medium text-text">List View</p>
        <p className="mt-1 text-xs text-text-muted">Space: {spaceId}</p>
      </div>
    </div>
  );
};
