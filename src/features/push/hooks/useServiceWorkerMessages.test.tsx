import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useServiceWorkerMessages } from './useServiceWorkerMessages';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockMarkRead = {
  mutate: vi.fn(),
};
vi.mock('@/features/notifications', () => ({
  useMarkNotificationRead: () => mockMarkRead,
}));

describe('useServiceWorkerMessages hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('handles startup ?notif=<id> query parameter, marks read, and strips parameter', () => {
    window.history.replaceState(null, '', '/my-tasks?task=123&notif=notif_999');

    renderHook(() => useServiceWorkerMessages());

    expect(mockMarkRead.mutate).toHaveBeenCalledWith('notif_999');
    expect(window.location.search).toBe('?task=123');
  });

  it('listens for NAVIGATE message from Service Worker, marks read, and navigates', () => {
    let messageListener: ((e: MessageEvent) => void) | null = null;

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        addEventListener: vi.fn((event, listener) => {
          if (event === 'message') {
            messageListener = listener;
          }
        }),
        removeEventListener: vi.fn(),
      },
      configurable: true,
      writable: true,
    });

    renderHook(() => useServiceWorkerMessages());

    expect(messageListener).toBeTypeOf('function');

    // Simulate SW postMessage
    const msgEvent = new MessageEvent('message', {
      data: {
        type: 'NAVIGATE',
        url: '/spaces/space_1?task=task_2',
        notificationId: 'notif_777',
      },
    });

    messageListener!(msgEvent);

    expect(mockMarkRead.mutate).toHaveBeenCalledWith('notif_777');
    expect(mockNavigate).toHaveBeenCalledWith('/spaces/space_1?task=task_2');
  });
});
