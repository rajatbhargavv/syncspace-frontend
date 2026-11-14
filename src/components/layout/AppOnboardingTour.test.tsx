import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppOnboardingTour, startAppTour } from './AppOnboardingTour';

describe('AppOnboardingTour', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders tour when startAppTour is dispatched', () => {
    render(<AppOnboardingTour />);

    act(() => {
      startAppTour();
    });

    expect(screen.getByRole('dialog', { name: /product tour guide/i })).toBeInTheDocument();
    expect(screen.getByText('Welcome to SyncSpace')).toBeInTheDocument();
  });

  it('navigates through steps with Next and Back buttons', () => {
    render(<AppOnboardingTour />);

    act(() => {
      startAppTour();
    });

    expect(screen.getByText('Welcome to SyncSpace')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/next/i));
    expect(screen.getByText('Spaces & Workspaces')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/back/i));
    expect(screen.getByText('Welcome to SyncSpace')).toBeInTheDocument();
  });

  it('closes and marks completed when Skip tutorial is clicked', () => {
    render(<AppOnboardingTour />);

    act(() => {
      startAppTour();
    });

    fireEvent.click(screen.getByText(/skip tutorial/i));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem('syncspace_onboarding_completed_v1')).toBe('true');
  });
});
