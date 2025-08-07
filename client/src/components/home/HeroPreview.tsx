import React, { useCallback, useRef } from 'react';
import { TOKENS, useReducedMotionPref, useIsTouch } from '../../utils/tokens';
import { CheckCircle2 } from 'lucide-react';

export const HeroPreview: React.FC = () => {
  const reduce = useReducedMotionPref();
  const isTouch = useIsTouch();
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || reduce || isTouch) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transform = `rotateX(${y * -9}deg) rotateY(${x * 12}deg)`;
        }
      });
    },
    [reduce, isTouch]
  );

  const reset = useCallback(() => {
    if (!ref.current || reduce || isTouch) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    ref.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  }, [reduce, isTouch]);

  return (
    <div
      className="relative mx-auto mt-10 w-full max-w-xl md:mt-0"
      onMouseMove={handleMove}
      onMouseLeave={reset}
      aria-hidden="true"
    >
      <div
        className={`${TOKENS.surfaceGlass} ${TOKENS.radius.xl} p-4 ${TOKENS.shadow}`}
        style={{ perspective: 500 }}
      >
        <div
          ref={ref}
          className={`${TOKENS.radius.lg} overflow-hidden border border-slate-200/70 dark:border-slate-800/70`}
          style={{
            transformStyle: "preserve-3d",
            transition: reduce ? "none" : "transform 200ms ease",
          }}
        >
          <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Lighthouse 98–100
                </div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Live Preview Surface
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Move your mouse to tilt
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-gradient-to-br from-blue-500/10 to-fuchsia-500/10"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
