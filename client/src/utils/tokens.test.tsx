import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Module under test
import { useReducedMotionPref, useIsTouch, useInViewOnce } from './tokens';

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
  const originalMaxTouchPoints = (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints;
  type MatchMediaMock = (q: string) => { matches: boolean };
  type TouchStartMock = () => void;

  beforeEach(() => {
    // reset mocks per test
    (window as unknown as { matchMedia?: MatchMediaMock }).matchMedia = originalMatchMedia as unknown as MatchMediaMock;
    (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints = originalMaxTouchPoints ?? 0;
    // clean potential properties
    delete (window as unknown as { ontouchstart?: TouchStartMock }).ontouchstart;
  });

  afterEach(() => {
    (window as unknown as { matchMedia?: MatchMediaMock }).matchMedia = originalMatchMedia as unknown as MatchMediaMock;
    (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints = originalMaxTouchPoints ?? 0;
    delete (window as unknown as { ontouchstart?: TouchStartMock }).ontouchstart;
  });

  it('useReducedMotionPref reflects matchMedia', () => {
    // no matchMedia -> falsey
    (window as unknown as { matchMedia?: MatchMediaMock }).matchMedia = undefined;
    expect(useReducedMotionPref()).toBe(false);

    // matchMedia true
    (window as unknown as { matchMedia?: MatchMediaMock }).matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as MatchMediaMock;
    expect(useReducedMotionPref()).toBe(true);

    // matchMedia false
    (window as unknown as { matchMedia?: MatchMediaMock }).matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as MatchMediaMock;
    expect(useReducedMotionPref()).toBe(false);
  });

  it('useIsTouch detects touch via ontouchstart or maxTouchPoints', () => {
    // default
    (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints = 0;
    delete (window as unknown as { ontouchstart?: TouchStartMock }).ontouchstart;
    expect(useIsTouch()).toBe(false);

    // via ontouchstart
    (window as unknown as { ontouchstart?: TouchStartMock }).ontouchstart = () => {};
    expect(useIsTouch()).toBe(true);

    // via maxTouchPoints
    delete (window as unknown as { ontouchstart?: TouchStartMock }).ontouchstart;
    (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints = 2;
    expect(useIsTouch()).toBe(true);
  });

  it('useInViewOnce returns ref and inView state (mocked true)', () => {
    render(<HookProbe />);
    expect(!!screen.getByTestId('probe')).toBe(true);
    expect(screen.getByTestId('state').textContent).toBe('true');
  });
});
