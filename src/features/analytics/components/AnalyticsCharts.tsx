import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartColors } from '../hooks/useChartColors';
import { bucketForChart, shareOf } from '../utils/analyticsUtils';
import type { AnalyticsRange, SpaceAnalytics } from '../types/analytics.types';

interface ChartProps {
  analytics: SpaceAnalytics;
  range: AnalyticsRange;
}

export const AnalyticsCharts: React.FC<ChartProps> = ({ analytics, range }) => {
  const colors = useChartColors();
  const [showTable, setShowTable] = useState(false);
  const points = useMemo(
    () => bucketForChart(analytics.tasksCompletedPerDay, range),
    [analytics.tasksCompletedPerDay, range],
  );
  const members = useMemo(
    () => [...analytics.workloadPerMember].sort((a, b) => b.activeTasksCount - a.activeTasksCount),
    [analytics.workloadPerMember],
  );
  const shares = shareOf(
    analytics.completionByMember.filter((member) => member.completedCount > 0),
  );
  const totalCompleted = analytics.completionByMember.reduce(
    (total, member) => total + member.completedCount,
    0,
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartCard title="Tasks completed over time" summary="Completed tasks by day or week.">
        <ChartTableToggle showTable={showTable} onChange={setShowTable} />
        {showTable ? (
          <SimpleTable
            headers={['Date', 'Completed']}
            rows={points.map((point) => [point.date, String(point.count)])}
          />
        ) : (
          <div className="h-64" aria-label="Area chart of completed tasks over time">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points}>
                <defs>
                  <linearGradient id="activity-accent-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.accent} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: colors.muted, fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: colors.muted, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: colors.surface, borderColor: colors.grid }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={colors.accent}
                  fill="url(#activity-accent-gradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Who completed the work" summary="Share of completed tasks by member.">
        <ChartTableToggle showTable={showTable} onChange={setShowTable} />
        {shares.length === 0 ? (
          <p className="flex h-64 items-center justify-center text-sm text-text-muted">
            No completed tasks in this period
          </p>
        ) : showTable ? (
          <SimpleTable
            headers={['Member', 'Completed', 'Share']}
            rows={shares.map((member) => [
              member.name,
              String(member.completedCount),
              `${member.percentage}%`,
            ])}
          />
        ) : (
          <div className="grid min-h-64 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,13rem)]">
            <div className="relative h-64" aria-label="Donut chart of completed tasks by member">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shares}
                    dataKey="completedCount"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="80%"
                  >
                    {shares.map((member, index) => (
                      <Cell
                        key={member.userId}
                        fill={colors.palette[index % colors.palette.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: colors.surface, borderColor: colors.grid }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-bold text-text">
                {totalCompleted}
              </span>
            </div>
            <ul className="space-y-2 self-center text-sm">
              {shares.map((member, index) => (
                <li key={member.userId} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colors.palette[index % colors.palette.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate">{member.name}</span>
                  <span className="text-text-muted">{member.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Current workload" summary="Active tasks assigned to each member.">
        <ChartTableToggle showTable={showTable} onChange={setShowTable} />
        {showTable ? (
          <SimpleTable
            headers={['Member', 'Active tasks']}
            rows={members.map((member) => [member.name, String(member.activeTasksCount)])}
          />
        ) : (
          <div className="h-64" aria-label="Bar chart of current workload by member">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={members} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: colors.muted, fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: colors.text, fontSize: 11 }}
                />
                <Tooltip contentStyle={{ background: colors.surface, borderColor: colors.grid }} />
                <Bar dataKey="activeTasksCount" fill={colors.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
};

function ChartCard({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="mb-3">
        <h2 className="font-heading font-bold text-text">{title}</h2>
        <p className="text-xs text-text-muted">{summary}</p>
      </div>
      {children}
    </section>
  );
}

function ChartTableToggle({
  showTable,
  onChange,
}: {
  showTable: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="mb-2 text-xs font-medium text-accent underline"
      onClick={() => onChange(!showTable)}
    >
      {showTable ? 'View chart' : 'View as table'}
    </button>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="max-h-64 overflow-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-border px-2 py-2 font-semibold text-text-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cell}-${cellIndex}`}
                  className="border-border/50 border-b px-2 py-2 text-text"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
