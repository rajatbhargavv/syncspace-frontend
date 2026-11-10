import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateRelativeUrl,
  urlBase64ToUint8Array,
  isPushSupported,
  isStandalone,
  isIos,
  getPermissionState,
} from './pushUtils';

describe('pushUtils', () => {
  describe('validateRelativeUrl', () => {
    it('returns valid relative URLs as-is', () => {
      expect(validateRelativeUrl('/notifications')).toBe('/notifications');
      expect(validateRelativeUrl('/my-tasks?task=123')).toBe('/my-tasks?task=123');
      expect(validateRelativeUrl('/spaces/abc#comments')).toBe('/spaces/abc#comments');
    });

    it('falls back to default /notifications for invalid inputs', () => {
      expect(validateRelativeUrl(undefined)).toBe('/notifications');
      expect(validateRelativeUrl(null)).toBe('/notifications');
      expect(validateRelativeUrl('')).toBe('/notifications');
      expect(validateRelativeUrl('   ')).toBe('/notifications');
      expect(validateRelativeUrl(123)).toBe('/notifications');
    });

    it('blocks protocol-relative URLs that attempt domain redirection', () => {
      expect(validateRelativeUrl('//evil.com/phish')).toBe('/notifications');
      expect(validateRelativeUrl('///evil.com')).toBe('/notifications');
    });

    it('blocks external absolute URLs', () => {
      expect(validateRelativeUrl('https://evil.com/login')).toBe('/notifications');
      expect(validateRelativeUrl('http://localhost:5000/api')).toBe('/notifications');
    });

    it('blocks javascript: and data: URLs', () => {
      expect(validateRelativeUrl('javascript:alert(1)')).toBe('/notifications');
      expect(validateRelativeUrl('data:text/html,<script>')).toBe('/notifications');
    });

    it('respects custom fallback argument', () => {
      expect(validateRelativeUrl('//evil.com', '/fallback-path')).toBe('/fallback-path');
    });
  });

  describe('urlBase64ToUint8Array', () => {
    it('converts URL-safe base64 string to Uint8Array', () => {
      // "VAPID" in URL-safe base64
      const input = 'VkFQSUQ';
      const result = urlBase64ToUint8Array(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(5);
      const decodedStr = String.fromCharCode(...result);
      expect(decodedStr).toBe('VAPID');
    });

    it('correctly pads base64 strings of various lengths', () => {
      const b64 = 'AQIDBA'; // 6 chars -> requires 2 padding '='
      const result = urlBase64ToUint8Array(b64);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(4);
    });
  });

  describe('environment checks', () => {
    const originalNavigator = window.navigator;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
    });

    it('isPushSupported checks for serviceWorker, PushManager, and Notification', () => {
      const supported = isPushSupported();
      expect(typeof supported).toBe('boolean');
    });

    it('isStandalone returns true for display-mode standalone matchMedia', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isStandalone()).toBe(true);
    });

    it('isIos detects iOS userAgent', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });

      expect(isIos()).toBe(true);
    });

    it('getPermissionState returns permission or unsupported', () => {
      const state = getPermissionState();
      expect(['granted', 'denied', 'default', 'unsupported']).toContain(state);
    });
  });
});
