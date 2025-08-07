import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading Component', () => {
  it('renders with title and subtitle', () => {
    render(<SectionHeading title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SectionHeading title="Title" subtitle="Subtitle" className="custom-class" />);
    const headingElement = screen.getByTestId('section-heading');
    expect(headingElement).toHaveClass('custom-class');
  });

  it('renders only title when subtitle is not provided', () => {
    render(<SectionHeading title="Only Title" />);
    expect(screen.getByText('Only Title')).toBeInTheDocument();
    expect(screen.queryByTestId('section-heading-subtitle')).not.toBeInTheDocument();
  });
});
