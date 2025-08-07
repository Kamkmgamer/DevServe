
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// A component that throws an error
const ProblemChild = () => {
  throw new Error('Test Error');
};

// Mock console.error to prevent logging during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child Component</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('should render the fallback UI when an error is thrown', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('should render a custom fallback component when provided', () => {
    const customFallback = <div>Custom Fallback</div>;
    render(
      <ErrorBoundary fallback={customFallback}>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });
});
