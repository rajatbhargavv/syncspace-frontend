import React from 'react';
import { useAuth } from '@/app/providers/useAuth';
import { useTheme } from '@/app/providers/useTheme';
import { THEME_PRESET } from '@/config/constants';
import { NotchCard } from '@/components/ui/NotchCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { preset, mode, setPreset, toggleMode } = useTheme();

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* Welcome banner */}
      <div className="flex flex-col justify-between gap-6 rounded-card border border-border bg-surface p-6 shadow-card md:flex-row md:items-center md:p-8">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Phase 0 Complete
            </span>
            <Badge variant="success" size="sm">
              Session Active
            </Badge>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text md:text-3xl">
            Welcome, {user?.name ?? 'Explorer'}!
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-text-muted">
            You are securely authenticated. Core foundation, HTTP single-flight refresh, tokens, and
            UI primitives are fully loaded.
          </p>
        </div>

        {/* Quick theme switcher toolbar */}
        <div className="bg-surface-hover/50 border-border/70 flex shrink-0 flex-col gap-2.5 rounded-card border p-4">
          <span className="text-xs font-semibold text-text">Live Theme Engine:</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(THEME_PRESET).map((key) => {
              const themeKey = key as keyof typeof THEME_PRESET;
              const isActive = preset === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setPreset(themeKey)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-accent bg-accent font-semibold text-text-inverse'
                      : 'border-border bg-surface text-text-muted hover:text-text'
                  }`}
                >
                  {themeKey}
                </button>
              );
            })}
          </div>
          <div className="border-border/50 flex items-center justify-between border-t pt-2 text-xs text-text-muted">
            <span>
              Mode: <strong className="capitalize text-text">{mode}</strong>
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-accent hover:underline"
            >
              Toggle {mode === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Signature UI showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-text">
            Signature Components Showcase
          </h2>
          <span className="text-xs text-text-muted">Interactive NotchCard variants</span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Variant 1: Member Card */}
          <NotchCard
            variant="member"
            name={user?.name ?? 'Jane Doe'}
            memberRole={`${user?.plan ?? 'FREE'} Member`}
            footerLeftLabel="Tasks"
            chips={['4 active', '12 done']}
            score={4}
            scoreLabel="Workload"
            onClick={() => {}}
          />

          {/* Variant 2: Highlighted "Next Up" Card */}
          <NotchCard
            variant="highlighted"
            title="Setup Space & Sprint Board"
            subtitle="Coming in Phase 1: Full App Shell & Spaces Flow"
            hasUnread={true}
            footerContent={
              <div className="text-text-inverse/90 flex items-center justify-between text-xs">
                <span>Priority: High</span>
                <span className="font-semibold">Ready for Phase 1</span>
              </div>
            }
          />

          {/* Variant 3: Task Card */}
          <NotchCard
            variant="task"
            title="Deploy real-time sync with WebSockets"
            subtitle="Core infrastructure pipeline"
            deadline="Due Tomorrow"
            statusBadge={
              <Badge variant="accent" size="sm">
                IN_PROGRESS
              </Badge>
            }
            actions={
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                Details
              </Button>
            }
          />
        </div>
      </div>

      {/* Roadmap Phase banner */}
      <div className="bg-surface/40 flex items-center justify-between rounded-card border border-border p-5">
        <div className="flex items-center gap-3">
          <div className="bg-accent/15 flex h-10 w-10 items-center justify-center rounded-full font-bold text-accent">
            1
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text">Next: Phase 1 — App Shell & Spaces</h4>
            <p className="text-xs text-text-muted">
              Collapsible sidebar, space switcher, Create Space multi-kind wizard, and member
              join/leave.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
