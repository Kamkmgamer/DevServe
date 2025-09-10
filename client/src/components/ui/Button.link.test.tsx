import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import Button from './Button';

describe('Button link behaviors', () => {
  it('renders as Link when "to" provided', () => {
    render(
      <MemoryRouter>
        <Button as={undefined as any} to="/home">Go Home</Button>
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /go home/i });
    expect(link).toBeInTheDocument();
  });

  it('renders a span with aria-disabled when disabled link', () => {
    render(
      <MemoryRouter>
        <Button as={undefined as any} to="/home" disabled>
          Disabled Link
        </Button>
      </MemoryRouter>
    );
    const el = screen.getByText(/disabled link/i);
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveAttribute('aria-disabled', 'true');
  });
});
