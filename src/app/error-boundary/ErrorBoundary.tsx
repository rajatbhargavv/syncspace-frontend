import React, { Component, type ErrorInfo } from 'react';
import { Button } from '@/components/ui/Button';
import { reportError } from '@/lib/reportError';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, { componentStack: errorInfo.componentStack });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = (): void => {
    window.location.assign('/');
  };

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-bg p-6 text-center text-text">
          <div className="bg-error/15 mb-4 flex h-14 w-14 items-center justify-center rounded-full text-error">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            We could not load this part of SyncSpace. Try again, or return to the home page.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={this.handleReset}>
              Try again
            </Button>
            <Button variant="secondary" onClick={this.handleGoHome}>
              Go home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
