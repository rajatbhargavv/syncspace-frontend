import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as pushModule from '@/features/push';
import * as authApi from '../api/auth.api';
import { useLogout } from './useLogout';

vi.mock('@/lib/socket', () => ({
  disconnectSocket: vi.fn(),
}));

vi.mock('@/features/push', () => ({
  unsubscribe: vi.fn().mockResolvedValue({ message: 'Unsubscribed' }),
}));

vi.mock('../api/auth.api', () => ({
  logout: vi.fn().mockResolvedValue({ message: 'Logged out' }),
}));

describe('useLogout hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unsubscribes push subscription and clears app badge before logout API call', async () => {
    const mockSub = {
      endpoint: 'https://push.example.com/sub/999',
      unsubscribe: vi.fn().mockResolvedValue(true),
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(mockSub),
          },
        }),
      },
      configurable: true,
      writable: true,
    });

    const clearAppBadgeMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clearAppBadge', {
      value: clearAppBadgeMock,
      configurable: true,
      writable: true,
    });

    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(pushModule.unsubscribe).toHaveBeenCalledWith('https://push.example.com/sub/999');
    expect(mockSub.unsubscribe).toHaveBeenCalled();
    expect(clearAppBadgeMock).toHaveBeenCalled();
    expect(authApi.logout).toHaveBeenCalled();
  });
});
