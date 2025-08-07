import { useInView } from 'framer-motion';
import { useRef } from 'react';

export const TOKENS = {
  radius: {
    md: "rounded-lg",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    full: "rounded-full",
  },
  ring: "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
  surfaceGlass:
    "bg-white/80 backdrop-blur border border-slate-200/70 dark:bg-slate-900/80 dark:border-slate-800/70",
  surfaceSoft:
    "bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70",
  textHeading: "text-slate-900 dark:text-white",
  textBody: "text-slate-600 dark:text-slate-300",
  textMuted: "text-slate-500 dark:text-slate-400",
  shadow: "shadow-sm hover:shadow-xl transition-shadow",
};

export const useReducedMotionPref = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const useIsTouch = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export const useInViewOnce = <T extends HTMLElement>(
  margin?: string
) => {
  const ref = useRef<T | null>(null);

  const inView = useInView(ref, {
    ...(margin ? { margin } : {}),
    once: true,
  } as any);

  return [ref, inView] as const;
};
