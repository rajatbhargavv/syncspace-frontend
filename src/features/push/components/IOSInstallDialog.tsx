import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export interface IOSInstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallDialog: React.FC<IOSInstallDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Install SyncSpace on iOS"
      description="Add SyncSpace to your Home Screen for instant alerts, fast access, and full PWA features."
    >
      <div className="space-y-4 py-2 text-sm text-text">
        <ol className="list-decimal space-y-3 pl-5 text-text-muted">
          <li>
            Tap the <span className="font-semibold text-text">Share</span> button in Safari&apos;s
            toolbar (the square with an arrow pointing up).
          </li>
          <li>
            Scroll down the share sheet and select{' '}
            <span className="font-semibold text-text">Add to Home Screen</span>.
          </li>
          <li>
            Tap <span className="font-semibold text-text">Add</span> in the top-right corner of your
            screen.
          </li>
          <li>
            Open <span className="font-semibold text-text">SyncSpace</span> from your Home Screen to
            enable push notifications and full standalone experience.
          </li>
        </ol>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
