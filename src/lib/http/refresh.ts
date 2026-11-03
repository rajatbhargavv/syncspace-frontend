import { API_ENDPOINTS } from '@/config/constants';
import { env } from '@/config/env';

let refreshPromise: Promise<boolean> | null = null;
let onAuthFailureCallback: (() => void) | null = null;

export function registerAuthFailureHandler(callback: () => void): () => void {
  onAuthFailureCallback = callback;
  return () => {
    if (onAuthFailureCallback === callback) {
      onAuthFailureCallback = null;
    }
  };
}

export function triggerAuthFailure(): void {
  if (onAuthFailureCallback) {
    onAuthFailureCallback();
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  // Single-flight: if a refresh is already in progress, wait on it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = doRefresh();

  try {
    const success = await refreshPromise;
    if (!success) {
      triggerAuthFailure();
    }
    return success;
  } catch {
    triggerAuthFailure();
    return false;
  } finally {
    refreshPromise = null;
  }
}

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${env.apiBaseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}