import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () =>
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'a, button, input, [tabindex]:not([tabindex="-1"])',
      ) ?? [];
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-modal md:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="safe-top safe-bottom safe-left relative z-modal h-full w-[min(85vw,20rem)] bg-surface shadow-elevated"
      >
        <Sidebar onNavigate={onClose} forceExpanded />
      </aside>
    </div>,
    document.body,
  );
};
