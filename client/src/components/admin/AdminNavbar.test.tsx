
import { render, screen, fireEvent, within } from '@testing-library/react';
import { AdminNavbar } from './AdminNavbar';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';

describe('AdminNavbar', () => {
  it('should render the navbar with links and search', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <AdminNavbar />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search sections… (Ctrl/⌘K)')).toBeInTheDocument();
  });

  it('should filter links based on search input', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <AdminNavbar />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search sections… (Ctrl/⌘K)');
    fireEvent.change(searchInput, { target: { value: 'blog' } });

    const searchResults = screen.getByTestId('search-results');
    expect(within(searchResults).getByText('Blog')).toBeInTheDocument();
    expect(within(searchResults).queryByText('Dashboard')).not.toBeInTheDocument();
  });
});
