import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Module under test
import { TOKENS, useReducedMotionPref, useIsTouch, useInViewOnce } from './tokens';

// Mock framer-motion's useInView
jest.mock('framer-motion', () => ({
  useInView: jest.fn().mockReturnValue(true),
}));

function HookProbe() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>('0px 0px -10% 0px');
  return (
    <div>
      <div data-testid="probe" ref={ref}>target</div>
      <div data-testid="state">{String(inView)}</div>
    </div>
  );
}

describe('tokens utils', () => {
  const originalMatchMedia = window.matchMedia;
  const originalMaxTouchPoints = (navigator as any).maxTouchPoints;

  beforeEach(() => {
    // reset mocks per test
    (window as any).matchMedia = originalMatchMedia;
    (navigator as any).maxTouchPoints = originalMaxTouchPoints ?? 0;
    // clean potential properties
    delete (window as any).ontouchstart;
  });

  afterEach(() => {
    (window as any).matchMedia = originalMatchMedia;
    (navigator as any).maxTouchPoints = originalMaxTouchPoints ?? 0;
    delete (window as any).ontouchstart;
  });

  it('exposes expected TOKENS structure', () => {
    expect(TOKENS.radius.md).toBeTruthy();
    expect(TOKENS.textBody).toContain('text-');
    expect(TOKENS.shadow).toContain('shadow');
  });

  it('useReducedMotionPref reflects matchMedia', () => {
    // no matchMedia -> falsey
    (window as any).matchMedia = undefined;
    expect(useReducedMotionPref()).toBe(false);

    // matchMedia true
    (window as any).matchMedia = jest.fn().mockReturnValue({ matches: true });
    expect(useReducedMotionPref()).toBe(true);

    // matchMedia false
    (window as any).matchMedia = jest.fn().mockReturnValue({ matches: false });
    expect(useReducedMotionPref()).toBe(false);
  });

  it('useIsTouch detects touch via ontouchstart or maxTouchPoints', () => {
    // default
    (navigator as any).maxTouchPoints = 0;
    delete (window as any).ontouchstart;
    expect(useIsTouch()).toBe(false);

    // via ontouchstart
    (window as any).ontouchstart = () => {};
    expect(useIsTouch()).toBe(true);

    // via maxTouchPoints
    delete (window as any).ontouchstart;
    (navigator as any).maxTouchPoints = 2;
    expect(useIsTouch()).toBe(true);
  });

  it('useInViewOnce returns ref and inView state (mocked true)', () => {
    render(<HookProbe />);
    expect(screen.getByTestId('probe')).toBeInTheDocument();
    expect(screen.getByTestId('state')).toHaveTextContent('true');
  });
});
