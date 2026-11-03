import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export interface ToasterProps {
  position?:
    'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export const Toaster: React.FC<ToasterProps> = ({ position = 'bottom-right' }) => {
  return (
    <SonnerToaster
      position={position}
      toastOptions={{
        className:
          '!bg-surface !text-text !border-border !rounded-card !shadow-elevated !text-sm !font-sans',
        descriptionClassName: '!text-text-muted !text-xs',
      }}
    />
  );
};