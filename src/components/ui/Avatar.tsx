import React from 'react';
import { cn } from '@/lib/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-red-500/20 text-red-400 border-red-500/30',
    'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'bg-pink-500/20 text-pink-400 border-pink-500/30',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index] ?? 'bg-surface text-text border-border';
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className, ...props }) => {
  const sizeStyles: Record<NonNullable<AvatarProps['size']>, string> = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base font-semibold',
    xl: 'h-16 w-16 text-xl font-bold',
  };

  const initials = getInitials(name);
  const colorClass = getColorFromName(name);

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border font-medium',
        sizeStyles[size],
        colorClass,
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Hide broken image to show fallback initials
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
