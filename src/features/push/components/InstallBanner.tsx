import React from 'react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { IOSInstallDialog } from './IOSInstallDialog';

export const InstallBanner: React.FC = () => {
  const { shouldShowBanner, promptInstall, dismissBanner, isIOSDialogOpen, closeIOSDialog } =
    useInstallPrompt();

  if (!shouldShowBanner) {
    return <IOSInstallDialog isOpen={isIOSDialogOpen} onClose={closeIOSDialog} />;
  }

  return (
    <>
      <div
        role="region"
        aria-label="App install banner"
        className="border-accent/20 bg-accent/10 relative flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 text-sm text-text"
      >
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">
            📱
          </span>
          <span>
            Install <strong className="font-semibold">SyncSpace</strong> for quick access and
            instant background notifications.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => void promptInstall()}>
            Install app
          </Button>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Dismiss install banner"
            onClick={dismissBanner}
          >
            ✕
          </IconButton>
        </div>
      </div>
      <IOSInstallDialog isOpen={isIOSDialogOpen} onClose={closeIOSDialog} />
    </>
  );
};
