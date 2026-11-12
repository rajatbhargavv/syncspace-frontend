export function reportError(error: Error, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error('SyncSpace error', { error, ...context });
  }
}
