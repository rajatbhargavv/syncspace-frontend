import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCrossSpaceTasks } from '@/features/tasks/hooks/useCrossSpaceTasks';
import { ActivityHeatmapCalendar } from '@/features/overview/components/ActivityHeatmapCalendar';
import { TodayAgenda } from '@/features/overview/components/TodayAgenda';

export const CalendarPage: React.FC = () => {
  const { spaces, agenda, activityData, isLoading } = useCrossSpaceTasks();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity Calendar"
        description="Comprehensive productivity heatmap across all spaces. Track your daily work output, streaks, and target completions."
      />

      <ActivityHeatmapCalendar spaces={spaces} activityData={activityData} isLoading={isLoading} />

      <TodayAgenda agenda={agenda} isLoading={isLoading} />
    </div>
  );
};
