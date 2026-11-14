import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

const STORAGE_KEY = 'syncspace_onboarding_completed_v1';

export function startAppTour() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('syncspace:start-tour'));
  }
}

interface TourStep {
  title: string;
  badge: string;
  icon: string;
  highlight: string;
  description: string;
  tips: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to SyncSpace',
    badge: 'Dashboard & Agenda',
    icon: '⚡',
    highlight: 'Your all-in-one workspace command center',
    description:
      'SyncSpace unifies all your tasks, projects, and team spaces into one fluid interface. See your daily agenda, cross-space tasks, and activity streak right on your dashboard.',
    tips: [
      'View tasks due today across every space without switching tabs',
      'Track your productivity with the GitHub-style activity streak heatmap',
      'Access quick shortcuts to your favorite spaces',
    ],
  },
  {
    title: 'Spaces & Workspaces',
    badge: 'Collaboration',
    icon: '🪐',
    highlight: 'Dedicated spaces for every team, project, or personal goal',
    description:
      'Organize your work into isolated or collaborative spaces. Each space has its own members, custom theme presets, activity charts, and permissions.',
    tips: [
      'Switch between Personal and Shared spaces effortlessly',
      'Customize themes (Hearth, Neon Grid, Ivory Ink, Orbit)',
      'Invite teammates with secure single-click invite links',
    ],
  },
  {
    title: 'Kanban Board & Views',
    badge: 'Task Management',
    icon: '📋',
    highlight: 'Fast, drag-and-drop task workflows',
    description:
      'Visualize progress seamlessly with the improved Kanban board. Move tasks across TODO, IN PROGRESS, and COMPLETED with fluid drag-and-drop.',
    tips: [
      'Collapse or expand columns to optimize screen space',
      'Create tasks directly inside any column with Quick Add',
      'Toggle between Kanban Board, List View, and Activity Calendar',
    ],
  },
  {
    title: 'Module Tags & Auto-Distribution',
    badge: 'Pro Feature',
    icon: '🏷️',
    highlight: 'Classify tasks by module and route them automatically',
    description:
      'Add module tags (e.g. #inventory, #ui, #backend) to instantly classify tasks. With SyncSpace Pro, use automated distribution to assign tasks to designated team members based on tags.',
    tips: [
      'Filter Kanban or List view by clicking any tag chip',
      'Automate task routing: send all #inventory tasks to Rajat, #ui to Mishthi',
      'Undo or re-run distribution anytime with full audit trails',
    ],
  },
  {
    title: 'Install Anywhere & My Tasks',
    badge: 'PWA & Mobile',
    icon: '📲',
    highlight: 'Desktop app, phone PWA, and push notifications',
    description:
      'Never miss a deadline. Install SyncSpace as a native PWA on your laptop, Android, or iPhone just like WhatsApp, with full offline access and background notifications.',
    tips: [
      'Track all tasks assigned to you across all spaces in "My Tasks"',
      'Scan the QR code to install instantly on your phone',
      'You can re-launch this tour anytime from your profile menu',
    ],
  },
];

export const AppOnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has already seen onboarding
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Small delay to let page render
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    const handleStartTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('syncspace:start-tour', handleStartTour);
    return () => window.removeEventListener('syncspace:start-tour', handleStartTour);
  }, []);

  const handleComplete = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignored
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep] ?? TOUR_STEPS[0]!;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product tour guide"
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20 text-lg">
              {step.icon}
            </span>
            <div>
              <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                {step.badge}
              </span>
              <h3 className="font-heading text-base font-bold text-text">{step.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleComplete}
            className="rounded-button px-2.5 py-1 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            Skip tutorial ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-3">
          <div className="rounded-lg bg-surface-hover/70 p-3 border border-border/50">
            <p className="text-xs font-semibold text-accent">{step.highlight}</p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">{step.description}</p>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Key Highlights:
            </span>
            <ul className="space-y-1.5">
              {step.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-text">
                  <span className="text-accent font-bold mt-0.5">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Step Indicator & Navigation */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                aria-label={`Jump to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-accent' : 'w-2 bg-border hover:bg-text-muted'
                }`}
              />
            ))}
            <span className="ml-2 text-[11px] text-text-muted">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button size="sm" variant="ghost" onClick={handlePrev}>
                Back
              </Button>
            )}
            <Button size="sm" variant="primary" onClick={handleNext}>
              {currentStep === TOUR_STEPS.length - 1 ? 'Get Started 🎉' : 'Next →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
