import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen } from '@/test/test-utils';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider } from '@/app/providers/AuthProvider';

describe('ProtectedRoute guard', () => {
  it('renders child routes when user is authenticated', async () => {
    // By default, MSW handler responds with mockUser to GET /api/users/me
    renderWithProviders(
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected Dashboard Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>,
      { initialEntries: ['/'] },
    );

    expect(await screen.findByText('Protected Dashboard Content')).toBeInTheDocument();
  });
});
