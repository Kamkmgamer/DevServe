import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ChevronDown,
  Code,
  Palette,
  Zap,
  ArrowRight,
  Play,
  Globe,
  Smartphone,
  Shield,
  Calendar,
  Star,
  ExternalLink,
  CheckCircle2,
  Trophy,
  Target,
  Rocket,
  ChevronRight,
  Sparkles,
  Handshake,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button"; 
import Container from "../components/layout/Container"; 
import toast from "react-hot-toast";

// =============================
// Utility Hooks & Tokens
// =============================
const TOKENS = {
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

const useReducedMotionPref = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useIsTouch = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

/**
 * Custom hook to detect if an element is in view once.
 * Returns a ref and a boolean indicating if the element is in view.
 *
 * @param margin - Margin string for IntersectionObserver (e.g. "0px 0px -20% 0px")
 */
const useInViewOnce = <T extends HTMLElement>(
  margin?: string
) => {
  const ref = useRef<T | null>(null);

  const inView = useInView(ref, {
    ...(margin ? { margin } : {}),
    once: true,
  } as any); 

  return [ref, inView] as const;
};


// =============================
// Reusable UI Primitives
// =============================
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  center,
  className,
}) => (
  <div
    className={`mx-auto mb-12 max-w-2xl ${center ? "text-center" : ""} ${
      className || ""
    }`}
  >
    <h2
      className={`mb-3 text-4xl font-bold tracking-tight ${TOKENS.textHeading}`}
    >
      {title}
    </h2>
    {subtitle && <p className={`text-lg ${TOKENS.textBody}`}>{subtitle}</p>}
  </div>
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children, ...p }) => (
  <div
    className={`${TOKENS.surfaceGlass} ${TOKENS.radius.lg} ${TOKENS.shadow}
      transition-transform duration-150 hover:-translate-y-0.5 focus-within:-translate-y-0.5 ${className}`}
    {...p}
  >
    {children}
  </div>
);

interface BadgeProps {
  tone?: "blue" | "slate" | "green" | "purple" | "fuchsia";
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ tone = "slate", children, className }) => {
  const map: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    slate: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${map[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 1.2,
  suffix = "",
}) => {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });
  const reduce = useReducedMotionPref();

  useEffect(() => {
    if (!isInView) return;
    if (reduce) {
      setCount(end);
      return;
    }
    let raf: number | null = null;
    const start = performance.now();
    const run = (t: number) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = easeOutCubic(p);
      setCount(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isInView, end, duration, reduce]);

  return (
    <span ref={ref} aria-live="polite">
      {count}
      {suffix}
    </span>
  );
};

interface GradientIconProps {
  children: React.ReactNode;
}

const GradientIcon: React.FC<GradientIconProps> = ({ children }) => (
  <div
    className={`inline-flex h-12 w-12 items-center justify-center ${TOKENS.radius.lg}
    bg-gradient-to-br from-blue-600 to-fuchsia-600 text-white shadow-lg ring-1 ring-white/10`}
  >
    {children}
  </div>
);

// =============================
// Hero: interactive preview (optimized)
// =============================
const HeroPreview: React.FC = () => {
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
        if (ref.current) { // Ensure ref.current is not null after check
          ref.current.style.transform = `rotateX(${y * -9}deg) rotateY(${
            x * 12
          }deg)`;
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

// =============================
// Tech Marquee (CSS animation + in-view pause)
// =============================
const TechMarquee: React.FC = () => {
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
  // Use a more generous margin for marquee to keep it animating longer
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

// =============================
// Testimonials (pause when not in view, accessible carousel)
// =============================
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
}) => (
  <figure
    className={`${TOKENS.surfaceGlass} ${TOKENS.radius.lg} p-6 ${TOKENS.shadow}`}
  >
    <div className="mb-3 flex gap-1 text-amber-400" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
    </div>
    <blockquote className={`mb-4 text-slate-700 dark:text-slate-200`}>
      “{quote}”
    </blockquote>
    <figcaption className={`text-sm ${TOKENS.textMuted}`}>
      <span className="font-medium text-slate-800 dark:text-slate-100">
        {author}
      </span>{" "}
      · {role}
    </figcaption>
  </figure>
);

const Testimonials: React.FC = () => {
  const slides = [
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
  ];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotionPref();
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>(); // Pauses auto-play when off-screen

  useEffect(() => {
    if (reduce || paused || !inView) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length, reduce, paused, inView]);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div
      ref={wrapRef}
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          prev();
          setPaused(true); // Pause on manual interaction
        }
        if (e.key === "ArrowRight") {
          next();
          setPaused(true); // Pause on manual interaction
        }
      }}
      tabIndex={0}
    >
      <div className="mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: reduce ? 0 : 10,
              scale: reduce ? 1 : 0.98,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: reduce ? 0 : -10,
              scale: reduce ? 1 : 0.98,
            }}
            transition={{ duration: 0.4 }}
            aria-live="polite"
            role="group"
            aria-label={`Testimonial ${index + 1} of ${slides.length}`}
          >
            <TestimonialCard {...slides[index]} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to testimonial ${i + 1}`}
            aria-current={i === index}
            className={`h-2 w-2 rounded-full transition-all ${
              i === index ? "w-6 bg-white/90" : "bg-white/50"
            } ${TOKENS.ring}`}
            onClick={() => {
              setIndex(i);
              setPaused(true); // Pause on manual interaction
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

// =============================
// Case Studies (with improved descriptions)
// =============================
const CaseStudies: React.FC = () => {
  const cases = [
    {
      title: "Fintech Dashboard",
      impact: "↑ 38% user retention",
      href: "https://portfolio-delta-ruby-48.vercel.app/",
      tag: "B2B",
      desc:
        "Refactored data layer and optimized charts; improved TTI by 42% and simplified workflows for B2B users.",
    },
    {
      title: "E‑commerce Revamp",
      impact: "↑ 24% conversion rate",
      href: "https://portfolio-delta-ruby-48.vercel.app/",
      tag: "DTC",
      desc:
        "Redesigned PDP/checkout, implemented performance budget, and A/B tested for significant UX wins.",
    },
    {
      title: "SaaS Marketing Site",
      impact: "↑ SEO traffic +67%",
      href: "https://portfolio-delta-ruby-48.vercel.app/",
      tag: "SaaS",
      desc:
        "Built fast-loading pages with semantic markup; improved Core Web Vitals and boosted organic search traffic.",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cases.map((c) => (
        <a
          key={c.title}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open case study: ${c.title}`}
          className={`group relative overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.lg} p-6 ${TOKENS.shadow}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="mb-3 flex items-center justify-between">
            <div className={`text-xs uppercase tracking-wide ${TOKENS.textMuted}`}>
              Case Study
            </div>
            <Badge tone="blue">{c.tag}</Badge>
          </div>
          <h3 className={`mb-1 text-lg font-semibold ${TOKENS.textHeading}`}>
            {c.title}
          </h3>
          <div className={`mb-2 text-sm ${TOKENS.textBody}`}>{c.impact}</div>
          <p className={`mb-4 text-sm ${TOKENS.textBody}`}>{c.desc}</p>
          <div className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:underline">
            View details
            <ExternalLink className="ml-1 h-4 w-4" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0"
          />
        </a>
      ))}
    </div>
  );
};

// =============================
// Process Timeline
// =============================
const Process: React.FC = () => {
  const steps = [
    {
      icon: Target,
      title: "Discovery",
      desc: "Clarify goals, users, KPIs, and constraints.",
    },
    { icon: Palette, title: "Design", desc: "Wireframes, UI kit, and flows." },
    { icon: Code, title: "Build", desc: "Implement, test, iterate fast." },
    { icon: Rocket, title: "Launch", desc: "Ship, monitor, optimize." },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <ol className="relative ml-3 border-l border-slate-200 dark:border-slate-800">
        {steps.map((s, i) => (
          <li key={s.title} className="mb-8 ml-6">
            <span
              className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white dark:ring-slate-900"
              aria-hidden="true"
            >
              <s.icon className="h-3.5 w-3.5" />
            </span>
            <h3 className={`mb-1 font-semibold ${TOKENS.textHeading}`}>
              {i + 1}. {s.title}
            </h3>
            <p className={`${TOKENS.textBody} text-sm`}>{s.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};

// =============================
// Pricing Teaser (cards)
// =============================
const PricingTeaser: React.FC = () => {
  const plans = [
    {
      name: "Starter",
      price: "2–4 weeks",
      pitch: "Perfect for landing pages or MVPs.",
      bullets: ["Design + Build", "Basic SEO", "Analytics setup"],
      cta: "/contact",
    },
    {
      name: "Growth",
      price: "4–8 weeks",
      pitch: "For apps, dashboards, and integrations.",
      bullets: ["Design system", "API & DB", "Performance budget"],
      cta: "/contact",
      featured: true,
    },
    {
      name: "Partner",
      price: "Ongoing",
      pitch: "Your long-term product partner.",
      bullets: ["Retainer", "Sprints", "Roadmap & reviews"],
      cta: "/contact",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((p) => (
        <Card
          key={p.name}
          className={`p-6 ${p.featured ? "ring-1 ring-blue-500/30" : ""}`}
        >
          <div className="mb-1 text-xs uppercase tracking-wide text-blue-600">
            {p.featured ? <Badge tone="blue">Recommended</Badge> : "Package"}
          </div>
          <h3 className={`mb-2 text-lg font-semibold ${TOKENS.textHeading}`}>
            {p.name}
          </h3>
          <div className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Timeline: {p.price}
          </div>
          <p className={`mb-4 text-sm ${TOKENS.textBody}`}>{p.pitch}</p>
          <ul className="mb-6 space-y-2 text-sm">
            {p.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className={`${TOKENS.textBody}`}>{b}</span>
              </li>
            ))}
          </ul>
          <Link to={p.cta}>
            <Button
              variant={p.featured ? "primary" : "cta-light"}
              className="w-full"
            >
              Let’s Talk
            </Button>
          </Link>
        </Card>
      ))}
    </div>
  );
};

// =============================
// FAQ (accessible headings)
// =============================
const FAQ: React.FC = () => {
  const faqs = [
    {
      q: "What stack do you use?",
      a:
        "React, TypeScript, Node, Tailwind, Postgres/Prisma, Next/Vite — chosen per project needs.",
    },
    {
      q: "How do we collaborate?",
      a:
        "Weekly check-ins, async updates, and a shared roadmap. You’ll always know status and next steps.",
    },
    {
      q: "Do you handle deployments?",
      a: "Yes — CI/CD, observability, and production readiness (Vercel/AWS).",
    },
    {
      q: "What about accessibility?",
      a:
        "WCAG-first mindset, semantic HTML, keyboard support, and prefers-reduced-motion respected.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl">
      {faqs.map((f, i) => (
        <Card key={f.q} className={`mb-3 p-4`}>
          <h3 className="text-base font-medium">
            <button
              className={`flex w-full items-center justify-between text-left ${TOKENS.ring}`}
              onClick={() => setOpen((o) => (o === i ? null : i))}
              aria-expanded={open === i}
              aria-controls={`faq-${i}`}
            >
              <span className={`${TOKENS.textHeading}`}>{f.q}</span>
              <ChevronRight
                className={`h-5 w-5 text-slate-500 transition-transform ${
                  open === i ? "rotate-90" : ""
                }`}
              />
            </button>
          </h3>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                id={`faq-${i}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className={`pt-3 text-sm ${TOKENS.textBody}`}>{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
};

// =============================
// Skeleton for Suspense fallbacks
// =============================
interface SectionSkeletonProps {
  rows?: number;
}

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ rows = 3 }) => (
  <div className="grid gap-6 md:grid-cols-3">
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

// =============================
// HomePage
// =============================
const HomePage: React.FC = () => {
  const reduce = useReducedMotionPref();
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 300], [0, reduce ? 0 : -60]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, reduce ? 1 : 0.9]);

  useEffect(() => {
    // Dismiss previous toasts and show welcome toast after a brief delay
    const t = setTimeout(() => {
      toast.dismiss();
      toast("Welcome! Explore the work and services below.", {
        icon: "👋",
        duration: 3000, // Toast disappears after 3 seconds
        ariaProps: { role: "status", "aria-live": "polite" }, // Announce to screen readers politely
      });
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: Code,
      title: "Custom Development",
      description:
        "Robust, scalable apps with React/Node and clean, maintainable code.",
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description:
        "Accessible, conversion‑focused interfaces that delight users.",
    },
    {
      icon: Zap,
      title: "Performance",
      description:
        "Core Web Vitals obsessed: ship fast experiences that rank and convert.",
    },
    {
      icon: Smartphone,
      title: "Responsive First",
      description: "Mobile‑first layouts that adapt beautifully across devices.",
    },
    {
      icon: Shield,
      title: "Security & Reliability",
      description:
        "Best practices, audits, and dependable hosting for peace of mind.",
    },
    {
      icon: Globe,
      title: "SEO Foundations",
      description:
        "Semantic HTML, metadata, and speed baked in for discoverability.",
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      {/* Skip link for keyboard navigation */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 rounded bg-blue-600 px-3 py-2 text-white"
      >
        Skip to content
      </a>

      {/* HERO SECTION */}
      <motion.section
        style={{ y: yHero, opacity: heroOpacity }}
        className="relative overflow-hidden"
      >
        {/* Background gradients and noise */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),transparent_60%)] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.2),transparent_60%)] blur-3xl" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]" />
        </div>

        <Container className="relative z-10 py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="text-center md:text-left">
              {/* Marketing Tag */}
              <span
                className={`mb-6 inline-flex items-center gap-2 ${TOKENS.radius.full} ${TOKENS.surfaceGlass} px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-200 dark:text-blue-200 dark:ring-slate-700`}
              >
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Now booking for Q3
              </span>
              {/* Hero Heading */}
              <h1
                className={`mb-5 text-5xl font-extrabold leading-tight tracking-tight ${TOKENS.textHeading} md:text-6xl lg:text-7xl`}
              >
                Build Modern Web
                <span className="block bg-gradient-to-r from-blue-600 via-fuchsia-600 to-teal-500 bg-clip-text text-transparent">
                  Experiences That Perform
                </span>
              </h1>
              {/* Hero Subtitle */}
              <p
                className={`mx-auto mb-8 max-w-xl ${TOKENS.textBody} md:mx-0 md:text-lg`}
              >
                From concept to launch, I craft fast, accessible products that
                look beautiful and drive measurable results.
              </p>
              {/* Call-to-action buttons */}
              <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
                <Link to="/contact" aria-label="Start your project">
                  <Button variant="primary" className="group">
                    Start Your Project
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a
                  href="https://portfolio-delta-ruby-48.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View my work"
                  title="Open portfolio in a new tab"
                >
                  <Button variant="secondary" className="group">
                    <Play className="mr-2 h-4 w-4" />
                    View Work
                  </Button>
                </a>
              </div>

              {/* Trust bar with animated counters */}
              <div
                className={`mx-auto max-w-xl ${TOKENS.surfaceGlass} ${TOKENS.radius.lg} p-4 md:mx-0`}
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Projects", value: 150, suffix: "+" },
                    { label: "Satisfaction", value: 98, suffix: "%" },
                    { label: "Years", value: 5, suffix: "+" },
                    { label: "Stack", value: 25, suffix: "+" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div
                        className={`text-xl font-bold ${TOKENS.textHeading}`}
                      >
                        <AnimatedCounter end={s.value} suffix={s.suffix} />
                      </div>
                      <div className={`text-xs ${TOKENS.textMuted}`}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology logos */}
              <div className="mt-8 flex items-center justify-center gap-4 md:justify-start">
                <img
                  src="/logos/vercel.svg"
                  srcSet="/logos/vercel.svg 1x, /logos/vercel@2x.svg 2x" // High-res for Retina
                  alt="Vercel"
                  width={80} // Explicit width for CLS prevention
                  height={20} // Explicit height for CLS prevention
                  className="h-5 w-auto opacity-70 grayscale"
                  loading="lazy" // Lazy load images below the fold
                />
                <img
                  src="/logos/aws.svg"
                  srcSet="/logos/aws.svg 1x, /logos/aws@2x.svg 2x"
                  alt="AWS"
                  width={60}
                  height={20}
                  className="h-5 w-auto opacity-70 grayscale"
                  loading="lazy"
                />
                <img
                  src="/logos/react.svg"
                  srcSet="/logos/react.svg 1x, /logos/react@2x.svg 2x"
                  alt="React"
                  width={60}
                  height={20}
                  className="h-5 w-auto opacity-70 grayscale"
                  loading="lazy"
                />
                <img
                  src="/logos/ts.svg"
                  srcSet="/logos/ts.svg 1x, /logos/ts@2x.svg 2x"
                  alt="TypeScript"
                  width={80}
                  height={20}
                  className="h-5 w-auto opacity-70 grayscale"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Visual (interactive preview) */}
            <HeroPreview />
          </div>

          {/* Scroll cue */}
          <div className="mt-10 flex flex-col items-center">
            <p className={`mb-2 text-sm ${TOKENS.textMuted}`}>
              Scroll to explore
            </p>
            {!reduce && (
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="h-6 w-6 text-slate-400" />
              </motion.div>
            )}
          </div>
        </Container>
      </motion.section>

      {/* Main content anchor for skip link */}
      <div id="main" />

      {/* Problem/Solution Section */}
      <section className="py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="mb-2 flex items-center gap-2 text-rose-600">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold">The Problem</span>
              </div>
              <h3 className={`mb-2 text-2xl font-bold ${TOKENS.textHeading}`}>
                Slow, confusing websites kill growth
              </h3>
              <p className={`${TOKENS.textBody}`}>
                Users bounce if they wait, search engines downrank sluggish
                sites, and teams lose time fighting complexity instead of
                shipping value.
              </p>
            </Card>
            <Card className="p-6">
              <div className="mb-2 flex items-center gap-2 text-emerald-600">
                <Handshake className="h-5 w-5" />
                <span className="font-semibold">The Solution</span>
              </div>
              <h3 className={`mb-2 text-2xl font-bold ${TOKENS.textHeading}`}>
                Design + engineering that move metrics
              </h3>
              <p className={`${TOKENS.textBody}`}>
                I align UX and performance with your KPIs so your product feels
                great and converts — while staying maintainable for your team.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Tech Marquee Section */}
      <section className="py-10">
        <Container>
          <TechMarquee />
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -20% 0px" }} // Animate when in view
            transition={{ duration: 0.45 }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <SectionHeading
              title="What I Do"
              subtitle="Comprehensive services to ship fast, accessible, and maintainable products."
              center
            />
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="p-6">
                <div className="mb-5">
                  <GradientIcon>
                    <f.icon className="h-6 w-6" />
                  </GradientIcon>
                </div>
                <h3
                  className={`mb-2 text-lg font-semibold ${TOKENS.textHeading}`}
                >
                  {f.title}
                </h3>
                <p className={`text-sm leading-relaxed ${TOKENS.textBody}`}>
                  {f.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Case Studies Section (Lazy Loaded) */}
      <section className="bg-white py-20 dark:bg-slate-950">
        <Container>
          <SectionHeading
            title="Recent Work"
            subtitle="A snapshot of projects that improved performance and outcomes."
            center
          />
          <Suspense fallback={<SectionSkeleton rows={3} />}>
            <CaseStudies />
          </Suspense>
          <div className="mt-10 flex justify-center">
            <Link to="/services">
              <Button variant="cta-light">Explore Services</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <Container>
          <SectionHeading
            title="How We’ll Work"
            subtitle="A simple, transparent process focused on outcomes."
            center
          />
          <Process />
        </Container>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-20">
        <Container>
          <SectionHeading
            title="Flexible Ways to Partner"
            subtitle="Pick a track that fits your scope and timeline."
            center
          />
          <PricingTeaser />
        </Container>
      </section>

      {/* Testimonials Section (Lazy Loaded) */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="mb-4 text-4xl font-bold">Client Feedback</h2>
            <p className="opacity-90">
              Trusted by teams to deliver quality and speed.
            </p>
          </div>
          <Suspense fallback={<SectionSkeleton rows={1} />}>
            <Testimonials />
          </Suspense>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <Container>
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Quick answers to common questions."
            center
          />
          <FAQ />
        </Container>
      </section>

      {/* CTA Band Section */}
      <section className="py-16">
        <Container>
          <div
            className={`relative overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.xl} p-8 md:p-12 ${TOKENS.shadow}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
            />
            <div className="mx-auto max-w-2xl text-center">
              <h3 className={`mb-3 text-3xl font-bold ${TOKENS.textHeading}`}>
                Ready to Start Your Project?
              </h3>
              <p className={`${TOKENS.textBody} mb-8`}>
                Let’s bring your vision to life with clean code and thoughtful
                design.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/contact">
                  <Button variant="primary">Get Started Today</Button>
                </Link>
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Schedule a call on Calendly"
                >
                  <Button variant="cta-ghost">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule a Call
                  </Button>
                </a>
              </div>
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Prefer email?{" "}
                <a
                  className="underline underline-offset-2"
                  href="mailto:khalilabdalmajeed@gmail.com?subject=Project%20Inquiry&body=Tell%20me%20about%20your%20project..."
                >
                  Send a brief
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* JSON-LD for SEO (adjust content as needed) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Your Name/Company Name",
            url: "https://khalil.mageed.net",
            logo: "https://khalil.mageed.net/path-to-logo.png",
            sameAs: [
              "https://github.com/kamkmgamer",
              "https://www.linkedin.com/in/kamkmgamer",
            ],
            jobTitle: "Frontend Engineer"
          }),
        }}
      />
      {/* CSS keyframes for marquee - add this to your global CSS if preferred */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `,
        }}
      />
    </div>
  );
};

export default HomePage;