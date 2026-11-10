import React from 'react';

export interface BoardViewProps {
  spaceId: string;
}

export const BoardView: React.FC<BoardViewProps> = ({ spaceId }) => {
  return (
    <div
      data-testid="board-view"
      aria-label="Board view"
      className="flex min-h-[320px] items-center justify-center rounded-card border border-dashed border-border p-8 text-center"
    >
      <div>
        <p className="font-heading font-medium text-text">Board View</p>
        <p className="mt-1 text-xs text-text-muted">Space: {spaceId}</p>
      </div>
    </div>
  );
};
