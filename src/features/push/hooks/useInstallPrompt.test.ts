import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as pushUtils from '../utils/pushUtils';
import { useInstallPrompt } from './useInstallPrompt';

describe('useInstallPrompt hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes as non-standalone when running in normal browser tab', () => {
    vi.spyOn(pushUtils, 'isStandalone').mockReturnValue(false);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(false);

    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isStandalone).toBe(false);
    expect(result.current.isInstallable).toBe(false);
  });

  it('captures beforeinstallprompt event and marks app as installable', () => {
    vi.spyOn(pushUtils, 'isStandalone').mockReturnValue(false);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(false);

    const { result } = renderHook(() => useInstallPrompt());

    const promptEvent = new Event('beforeinstallprompt');
    Object.assign(promptEvent, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    });

    act(() => {
      window.dispatchEvent(promptEvent);
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it('promptInstall calls event.prompt() and tracks acceptance', async () => {
    vi.spyOn(pushUtils, 'isStandalone').mockReturnValue(false);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(false);

    const { result } = renderHook(() => useInstallPrompt());

    const promptMock = vi.fn().mockResolvedValue(undefined);
    const promptEvent = new Event('beforeinstallprompt');
    Object.assign(promptEvent, {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    });

    act(() => {
      window.dispatchEvent(promptEvent);
    });

    let outcome = false;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe(true);
    expect(promptMock).toHaveBeenCalled();
    expect(result.current.isStandalone).toBe(true);
  });

  it('opens iOS instructions dialog when promptInstall is called on iOS device', async () => {
    vi.spyOn(pushUtils, 'isStandalone').mockReturnValue(false);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(true);

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isIosDevice).toBe(true);
    expect(result.current.isInstallable).toBe(true);

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(result.current.isIOSDialogOpen).toBe(true);
  });

  it('handles appinstalled event and clears installable state', () => {
    vi.spyOn(pushUtils, 'isStandalone').mockReturnValue(false);

    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.isStandalone).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });
});
