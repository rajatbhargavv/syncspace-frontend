import React from 'react';
import { cn } from '@/lib/cn';
import { Avatar } from './Avatar';

export interface NotchCardMemberProps {
  variant?: 'member';
  name: string;
  memberRole: string;
  avatarSrc?: string;
  footerLeftLabel?: string;
  chips?: string[];
  score?: number; // 0 to 5
  scoreLabel?: string;
  onArrowClick?: () => void;
}

export interface NotchCardHighlightedProps {
  variant: 'highlighted';
  title: string;
  subtitle?: string;
  hasUnread?: boolean;
  onBellClick?: () => void;
  footerContent?: React.ReactNode;
}

export interface NotchCardTaskProps {
  variant: 'task';
  title: string;
  subtitle?: string;
  deadline?: string;
  isOverdue?: boolean;
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
  onArrowClick?: () => void;
}

export interface NotchCardCustomProps {
  variant: 'custom';
  children: React.ReactNode;
  onArrowClick?: () => void;
}

export type NotchCardProps = (
  NotchCardMemberProps | NotchCardHighlightedProps | NotchCardTaskProps | NotchCardCustomProps
) & {
  className?: string;
  onClick?: () => void;
};

const DOT_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-400'];

export const NotchCard: React.FC<NotchCardProps> = (props) => {
  const { className, onClick } = props;
  const isHighlighted = props.variant === 'highlighted';

  const cardClassName = cn(
    'group relative overflow-hidden rounded-card transition-all duration-200 p-5 flex flex-col justify-between select-none border',
    onClick && 'cursor-pointer hover:-translate-y-1',
    isHighlighted
      ? 'bg-accent text-text-inverse border-accent-hover shadow-elevated'
      : 'bg-surface hover:bg-surface-hover/80 text-text border-border shadow-card hover:shadow-elevated',
    className,
  );

  const content = (
    <>
      {/* Top right notch button container */}
      <div className="absolute right-3 top-3 z-10">
        {props.variant === 'highlighted' ? (
          <button
            type="button"
            aria-label="Notifications"
            onClick={(e) => {
              e.stopPropagation();
              props.onBellClick?.();
            }}
            className="bg-text-inverse/20 hover:bg-text-inverse/30 relative flex h-8 w-8 items-center justify-center rounded-full text-text-inverse transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {props.hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-white ring-2 ring-accent" />
            )}
          </button>
        ) : (
          <button
            type="button"
            aria-label="Open item"
            onClick={(e) => {
              e.stopPropagation();
              if ('onArrowClick' in props) {
                props.onArrowClick?.();
              }
            }}
            className={cn(
              'border-border/80 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200',
              'bg-surface-hover/70 text-text-muted group-hover:border-accent group-hover:bg-accent group-hover:text-text-inverse',
            )}
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7V17"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Card Content based on variant */}
      {props.variant === 'highlighted' && (
        <div className="flex flex-col gap-3 pr-10">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              Next Up
            </span>
            <h4 className="mt-0.5 font-heading text-base font-bold text-text-inverse">
              {props.title}
            </h4>
            {props.subtitle && (
              <p className="text-text-inverse/80 mt-1 text-xs">{props.subtitle}</p>
            )}
          </div>
          {props.footerContent && <div className="mt-2 pt-2">{props.footerContent}</div>}
        </div>
      )}

      {props.variant === 'task' && (
        <div className="flex flex-col gap-3 pr-10">
          <div>
            <div className="mb-1.5 flex items-center gap-2">{props.statusBadge}</div>
            <h4 className="line-clamp-2 text-sm font-semibold text-text">{props.title}</h4>
            {props.subtitle && (
              <p className="mt-1 line-clamp-1 text-xs text-text-muted">{props.subtitle}</p>
            )}
          </div>
          <div className="border-border/60 flex items-center justify-between border-t pt-2 text-xs">
            {props.deadline && (
              <span
                className={cn(
                  'text-xs font-medium',
                  props.isOverdue ? 'font-semibold text-error' : 'text-text-muted',
                )}
              >
                {props.deadline}
              </span>
            )}
            {props.actions && <div className="flex items-center gap-1.5">{props.actions}</div>}
          </div>
        </div>
      )}

      {(props.variant === 'member' || !props.variant) && (
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="flex items-start gap-3 pr-10">
            <Avatar name={props.name} src={props.avatarSrc} size="md" />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-text">{props.name}</h4>
              <p className="mt-0.5 truncate text-xs text-text-muted">{props.memberRole}</p>
            </div>
          </div>

          {/* Footer row */}
          <div className="border-border/50 flex items-center justify-between border-t pt-3">
            {/* Left side: small muted label + tiny chips */}
            <div className="flex min-w-0 items-center gap-1.5">
              {props.footerLeftLabel && (
                <span className="shrink-0 text-[11px] text-text-muted">
                  {props.footerLeftLabel}
                </span>
              )}
              {props.chips?.map((chip, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-border bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-text-muted"
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* Right side: score label + 5 colored dots */}
            <div className="flex shrink-0 items-center gap-2">
              {props.scoreLabel && (
                <span className="text-[11px] text-text-muted">{props.scoreLabel}</span>
              )}
              <div
                className="flex items-center gap-1"
                aria-label={`Score ${props.score ?? 0} of 5`}
              >
                {DOT_COLORS.map((colorClass, i) => {
                  const isActive = (props.score ?? 0) > i;
                  return (
                    <span
                      key={i}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-opacity',
                        colorClass,
                        isActive ? 'opacity-100' : 'opacity-20',
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {props.variant === 'custom' && <div>{props.children}</div>}
    </>
  );

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={cardClassName}
      >
        {content}
      </div>
    );
  }

  return <div className={cardClassName}>{content}</div>;
};
