import React from 'react';

export interface CalendarViewProps {
  spaceId: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ spaceId }) => {
  return (
    <div
      data-testid="calendar-view"
      aria-label="Calendar view"
      className="flex min-h-[320px] items-center justify-center rounded-card border border-dashed border-border p-8 text-center"
    >
      <div>
        <p className="font-heading font-medium text-text">Calendar View</p>
        <p className="mt-1 text-xs text-text-muted">Space: {spaceId}</p>
      </div>
    </div>
  );
};
