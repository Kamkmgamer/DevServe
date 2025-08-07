import React, { useMemo, useState } from 'react';
import { TOKENS, useReducedMotionPref, useInViewOnce } from '../../utils/tokens';

export const TechMarquee: React.FC = () => {
  const reduce = useReducedMotionPref();
  const items = useMemo(
    () => [
      "React",
      "TypeScript",
      "Next.js",
      "Node.js",
      "Tailwind",
      "Framer Motion",
      "PostgreSQL",
      "Prisma",
      "AWS",
      "Vercel",
      "Vite",
      "Turborepo",
      "Playwright",
      "Vitest",
    ],
    []
  );
  const [paused, setPaused] = useState(false);
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>("0px 0px -10% 0px");

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.lg} p-4`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Technologies"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent dark:from-slate-900" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent dark:from-slate-900" />
      {reduce ? (
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item, i) => (
            <span
              key={i}
              className="rounded-full border border-slate-200/70 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-800/70 dark:text-slate-200"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <div
          className={`flex w-max gap-6 whitespace-nowrap will-change-transform`}
          style={{
            animation:
              paused || !inView ? "none" : "marquee 20s linear infinite",
          }}
          aria-hidden="true"
        >
          {[0, 1].map((track) => (
            <div className="flex gap-6" key={track}>
              {items.map((item, i) => (
                <span
                  key={`${track}-${i}`}
                  className="rounded-full border border-slate-200/70 px-4 py-2 text-sm text-slate-700 dark:border-slate-800/70 dark:text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
