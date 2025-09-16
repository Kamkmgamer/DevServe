import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, Variants, easeInOut } from "framer-motion";
import { Star } from "lucide-react";
import Button from "../ui/Button";
import { TOKENS, useReducedMotionPref, useInViewOnce } from "../../utils/tokens";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

type TestimonialCardProps = Testimonial;

const cardVariants: Variants = {
  enter: {
    x: 0,
    opacity: 0,
    scale: 0.96,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easeInOut,
    },
  },
  exit: {
    x: 0,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.4,
      ease: easeInOut,
    },
  },
};

const TestimonialCardBase: React.FC<TestimonialCardProps> = ({ quote, author, role }) => (
  <motion.figure
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 220, damping: 18 }}
    className={`${TOKENS.surfaceGlass} ${TOKENS.radius.xl} p-6 sm:p-8 ${TOKENS.shadow} backdrop-blur-md border border-white/10 dark:border-white/5 relative z-0 overflow-visible`}
  >
    <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden -z-10">
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
    </div>

    <div className="mb-3 flex gap-1 text-amber-400" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current drop-shadow" />
      ))}
    </div>
    <blockquote className="mb-4 text-lg sm:text-xl leading-relaxed italic text-slate-700 dark:text-slate-200">
      “{quote}”
    </blockquote>
    <figcaption className={`text-sm ${TOKENS.textMuted}`}>
      <span className="font-medium text-slate-900 dark:text-slate-100">{author}</span>
      <span className="mx-1 text-slate-400">·</span>
      {role}
    </figcaption>
  </motion.figure>
);

const TestimonialCard = React.memo(TestimonialCardBase);

export const Testimonials: React.FC = () => {
  const slides: Testimonial[] = useMemo(() => [
    {
      quote:
        "Delivered ahead of schedule with flawless performance. Our conversions improved immediately.",
      author: "Alex Rivera",
      role: "Marketing Lead, Nova",
    },
    {
      quote:
        "Clean architecture and superb communication. The handoff to our team was effortless.",
      author: "Priya Shah",
      role: "CTO, LumenX",
    },
    {
      quote:
        "Beautiful UI and lightning fast. SEO gains were visible within weeks.",
      author: "Daniel Kim",
      role: "Founder, Arc Labs",
    },
  ], []);

  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoveringRef = useRef(false);
  const reduce = useReducedMotionPref();
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>();

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  // Helper to start/stop autoplay without causing re-renders
  const startAutoplay = useCallback(() => {
    if (intervalRef.current) return;
    if (reduce || !inView || hoveringRef.current) return;
    intervalRef.current = setInterval(next, 6000);
  }, [next, reduce, inView]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  return (
    <div
      ref={wrapRef}
      className="relative group"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => {
        // Keep autoplay running on hover; do not stop interval
      }}
      onMouseLeave={() => {
        // Do not restart autoplay; interval was never stopped
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          prev();
          hoveringRef.current = true;
          stopAutoplay();
        }
        if (e.key === "ArrowRight") {
          next();
          hoveringRef.current = true;
          stopAutoplay();
        }
      }}
      tabIndex={0}
    >
      <div className="mx-auto max-w-4xl px-8 sm:px-10 overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="overflow-visible transform-gpu p-2 md:p-3"
            aria-live="polite"
            role="group"
            aria-label={`Testimonial ${index + 1} of ${slides.length}`}
          >
            <TestimonialCard {...slides[index]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="mt-4 flex justify-center">
        <div className="h-1 w-56 sm:w-72 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden" aria-hidden>
          <motion.div
            key={`progress-${index}-${reduce}`}
            initial={{ width: 0 }}
            animate={{ width: reduce ? 0 : "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-amber-400 group-hover:opacity-60"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to testimonial ${i + 1}`}
            aria-current={i === index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 bg-amber-400 shadow-lg"
                : "bg-white/50 hover:bg-white/70"
            } ${TOKENS.ring}`}
            onClick={() => {
              setIndex(i);
              hoveringRef.current = true;
              stopAutoplay();
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <Button variant="cta-ghost" onClick={prev} aria-label="Previous testimonial">
          Prev
        </Button>
        <Button variant="cta-ghost" onClick={next} aria-label="Next testimonial">
          Next
        </Button>
      </div>
    </div>
  );
};
