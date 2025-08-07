import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, jest } from '@jest/globals';
import Navbar from './Navbar';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { ThemeContext } from '../../contexts/ThemeContext';

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
    expect(screen.getByText('DevServe')).toBeInTheDocument();
  });
});
