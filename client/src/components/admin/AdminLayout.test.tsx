import { render, screen, within } from '@testing-library/react';
import { AdminLayout } from './AdminLayout';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';

describe('AdminLayout', () => {
  it('should render the correct breadcrumbs and page title for a nested route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/services/123/edit']}>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/admin/*" element={<AdminLayout />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('link', { name: 'Admin' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Services' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: '123' })).toBeInTheDocument();
    expect(within(nav).getByText('Edit')).toBeInTheDocument();

    // Check for page title
    expect(screen.getByRole('heading', { name: 'Edit' })).toBeInTheDocument();
  });

  it('should render the correct page title for a route with a numeric ID', () => {
    render(
      <MemoryRouter initialEntries={['/admin/services/123']}>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/admin/*" element={<AdminLayout />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Check for page title
    expect(screen.getByRole('heading', { name: 'Details' })).toBeInTheDocument();
  });
});