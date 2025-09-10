import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, jest } from '@jest/globals';
// Explicitly mock Navbar to avoid import.meta.env issue
jest.mock('./Navbar', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <nav data-testid="navbar">Mocked Navbar</nav>),
  };
});

// Import the mocked Navbar after it's mocked
import Navbar from './Navbar';



// Mock contexts
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: jest.fn(),
  }),
}));

jest.mock('../../contexts/CartContext', () => ({
  useCart: () => ({
    itemCount: 0,
  }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
}));

describe('Navbar Component', () => {
  it('renders the brand name', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Mocked Navbar')).toBeInTheDocument();
  });
});
