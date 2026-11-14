export function startAppTour(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('syncspace:start-tour'));
  }
}
