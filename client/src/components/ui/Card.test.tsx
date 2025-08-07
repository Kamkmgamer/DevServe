import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card><div>Test Content</div></Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class"><div>Test Content</div></Card>);
    const cardElement = screen.getByTestId('card-container');
    expect(cardElement).toHaveClass('custom-class');
  });
});
