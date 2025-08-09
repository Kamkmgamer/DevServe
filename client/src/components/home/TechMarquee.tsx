import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TOKENS, useReducedMotionPref, useInViewOnce } from "../../utils/tokens";

interface TechMarqueeProps {
  speed?: number; // seconds per loop
}

export const TechMarquee: React.FC<TechMarqueeProps> = ({ speed = 20 }) => {
  const reduce = useReducedMotionPref();
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>("0px 0px -10% 0px");

  const items = useMemo(
    () => [
      "React",
      "TypeScript",
      "Next.js",
      "Node.js",
      "Tailwind CSS",
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

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.lg} p-4`}
      aria-label="Technologies used"
    >
      {/* Left and Right Fade Edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/80 to-transparent dark:from-slate-900/80" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/80 to-transparent dark:from-slate-900/80" />

      {reduce ? (
        // Reduced motion: static grid
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-100 dark:text-slate-200 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-lg border border-white/20 shadow-sm"
            >
              {item}
            </motion.span>
          ))}
        </div>
      ) : (
        // Animated marquee
        <motion.div
          className="flex w-max gap-6 whitespace-nowrap will-change-transform"
          style={{
            animation: inView ? `marquee ${speed}s linear infinite` : "none",
          }}
          aria-hidden="true"
        >
          {[0, 1].map((track) => (
            <div className="flex gap-6" key={track}>
              {items.map((item, i) => (
                <motion.span
                  key={`${track}-${i}`}
                  animate={{
                    y: [0, -5, 0], // bounce up and down
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.15, // stagger dancing
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.4 },
                  }}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-100 dark:text-slate-200 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-lg border border-white/20 shadow-sm transition-all"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {/* Keyframes */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
};
