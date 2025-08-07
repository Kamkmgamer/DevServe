import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { SectionSkeleton } from './SectionSkeleton';

describe('SectionSkeleton Component', () => {
  it('renders without crashing', () => {
    render(<SectionSkeleton />);
    expect(screen.getByTestId('section-skeleton')).toBeInTheDocument();
  });

  it('renders correct number of skeleton items', () => {
    render(<SectionSkeleton rows={5} />);
    const skeletonItems = screen.getByTestId('section-skeleton').children;
    expect(skeletonItems.length).toBe(5);
  });

  it('applies default classes to inner skeleton items', () => {
    render(<SectionSkeleton />);
    const skeletonItem = screen.getByTestId('section-skeleton').firstChild;
    expect(skeletonItem).toHaveClass('animate-pulse');
  });

  it('applies custom className to the container', () => {
    render(<SectionSkeleton className="custom-class" />);
    const skeletonElement = screen.getByTestId('section-skeleton');
    expect(skeletonElement).toHaveClass('custom-class');
  });
});
