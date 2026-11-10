import React, { useEffect, useState } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-warning/30 bg-warning/15 flex items-center justify-center gap-2 border-b px-4 py-2 text-center text-xs font-medium text-warning"
    >
      <span aria-hidden="true">⚠️</span>
      <span>You&apos;re offline. Changes can&apos;t be saved.</span>
    </div>
  );
};
