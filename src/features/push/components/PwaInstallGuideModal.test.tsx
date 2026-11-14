import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PwaInstallGuideModal } from './PwaInstallGuideModal';

vi.mock('../hooks/useInstallPrompt', () => ({
  useInstallPrompt: () => ({
    promptInstall: vi.fn().mockResolvedValue(true),
    isInstallable: true,
    isStandalone: false,
    isIosDevice: false,
    isIOSDialogOpen: false,
    shouldShowBanner: false,
    openIOSDialog: vi.fn(),
    closeIOSDialog: vi.fn(),
    dismissBanner: vi.fn(),
  }),
}));

describe('PwaInstallGuideModal', () => {
  it('renders modal with tabs and steps when open', () => {
    const handleClose = vi.fn();
    render(<PwaInstallGuideModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Download SyncSpace App')).toBeInTheDocument();
    expect(screen.getByText('Laptop / PC')).toBeInTheDocument();
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(screen.getByText('iPhone / iPad')).toBeInTheDocument();
  });

  it('switches to Android and iOS tabs on click', () => {
    render(<PwaInstallGuideModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('Android'));
    expect(screen.getByText('Open in Chrome')).toBeInTheDocument();
    expect(screen.getByText('Tap Three Dots ⋮')).toBeInTheDocument();

    fireEvent.click(screen.getByText('iPhone / iPad'));
    expect(screen.getByText('Open in Safari')).toBeInTheDocument();
    expect(screen.getByText('Tap Share Button ⎋')).toBeInTheDocument();
  });

  it('renders QR code scan guide', () => {
    render(<PwaInstallGuideModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByAltText('Scan to open on phone')).toBeInTheDocument();
    expect(screen.getByText('Want SyncSpace on your phone right now?')).toBeInTheDocument();
  });
});
