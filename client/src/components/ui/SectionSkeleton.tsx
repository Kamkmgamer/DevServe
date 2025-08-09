import React from 'react';
import { TOKENS } from '../../utils/tokens';

interface SectionSkeletonProps {
  rows?: number;
  className?: string;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ rows = 3, className = "" }) => (
  <div className={`grid gap-6 md:grid-cols-3 ${className}`} data-testid="section-skeleton">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={`${TOKENS.surfaceSoft} ${TOKENS.radius.lg} p-6 animate-pulse`}
      >
        <div className="mb-4 h-4 w-24 rounded bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="mb-2 h-6 w-3/4 rounded bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="mb-2 h-3 w-full rounded bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="h-3 w-2/3 rounded bg-slate-200/70 dark:bg-slate-800/70" />
      </div>
    ))}
  </div>
);
