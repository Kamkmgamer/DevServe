import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Container from "../components/layout/Container";
import toast from "react-hot-toast";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2,
  suffix = "",
}) => {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number | undefined;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min(
          (timestamp - startTime) / (duration * 1000),
          1
        );
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6 }}
      className="group rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-900"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg ring-1 ring-white/10">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </motion.div>
  );
};

const TechMarquee: React.FC = () => {
  const items = [
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
    "Vite"
  ];

  // Duration controls speed; increase for slower, decrease for faster.
  const duration = 18;

  return (
    <div className="relative overflow-hidden">
      {/* Edge gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent dark:from-slate-900" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent dark:from-slate-900" />

      <div className="relative">
        {/* Track wrapper to avoid nowrap issues and keep flow consistent */}
        <motion.div
          className="flex w-max gap-6 whitespace-nowrap will-change-transform"
          style={{ x: "0%" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Track A */}
          <div className="flex gap-6">
            {items.map((item, i) => (
              <span
                key={`a-${item}-${i}`}
                className="rounded-full border border-slate-200/70 px-4 py-2 text-sm text-slate-700 dark:border-slate-800/70 dark:text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
          {/* Track B (duplicate) */}
          <div className="flex gap-6">
            {items.map((item, i) => (
              <span
                key={`b-${item}-${i}`}
                className="rounded-full border border-slate-200/70 px-4 py-2 text-sm text-slate-700 dark:border-slate-800/70 dark:text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  role: string;
}> = ({ quote, author, role }) => {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
      <div className="mb-3 flex gap-1 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="mb-4 text-slate-700 dark:text-slate-200">&ldquo;{quote}&rdquo;</p>
      <div className="text-sm text-slate-500 dark:text-slate-400">
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {author}
        </span>{" "}
        &middot; {role}
      </div>
    </div>
  );
};

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

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative">
      <div className="mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <TestimonialCard {...slides[index]} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-blue-600"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

const CaseStudies: React.FC = () => {
  const cases = [
    {
      title: "Fintech Dashboard",
      impact: "↑ 38% user retention",
      href: "https://portfolio-delta-ruby-48.vercel.app/",
    },
    {
      title: "E‑commerce Revamp",
      impact: "↑ 24% conversion rate",
      href: "https://portfolio-delta-ruby-48.vercel.app/",
    },
    {
      title: "SaaS Marketing Site",
      impact: "↑ SEO traffic +67%",
      href: "https://portfolio-delta-ruby-48.vercel.app/",
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
          className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-900"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="mb-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Case Study
          </div>
          <div className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            {c.title}
          </div>
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            {c.impact}
          </div>
          <div className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:underline">
            View details
            <ExternalLink className="ml-1 h-4 w-4" />
          </div>
        </a>
      ))}
    </div>
  );
};

const HomePage: React.FC = () => {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 300], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.85]);
  const navigate = useNavigate();

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
        "Core Web Vitals obsessed. Ship fast experiences that rank and convert.",
    },
    {
      icon: Smartphone,
      title: "Responsive First",
      description:
        "Mobile‑first layouts that adapt beautifully across devices.",
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

  useEffect(() => {
    // Example welcome toast to show interactivity
    const t = setTimeout(() => {
      toast.dismiss();
      toast("Welcome! Explore the work and services below.", {
        icon: "👋",
      });
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <motion.section
        style={{ y: yHero, opacity: heroOpacity }}
        className="relative flex min-h-[92vh] items-center overflow-hidden py-20"
      >
        {/* Gradient mesh background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25),transparent_60%)] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.22),transparent_60%)] blur-3xl" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]" />
        </div>

        {/* Animated orbs */}
        <motion.div
          aria-hidden="true"
          className="absolute -left-24 top-24 h-40 w-40 rounded-full bg-blue-500/20 blur-xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -right-24 bottom-24 h-56 w-56 rounded-full bg-purple-500/20 blur-xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        />

        <Container className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-200 backdrop-blur dark:bg-slate-900/60 dark:text-blue-200 dark:ring-slate-700">
              ✨ Now booking for Q3
            </span>
            <h1 className="mb-5 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white md:text-7xl">
              Build Modern Web
              <span className="block bg-gradient-to-r from-blue-600 via-fuchsia-600 to-teal-500 bg-clip-text text-transparent">
                Experiences That Perform
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-300 md:text-xl">
              From concept to launch, I craft fast, accessible products that
              look beautiful and drive measurable results.
            </p>
            <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
              >
                <Button variant="secondary" className="group">
                  <Play className="mr-2 h-4 w-4" />
                  View Work
                </Button>
              </a>
            </div>

            {/* Quick stats inline */}
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-6 rounded-2xl border border-slate-200/70 bg-white/70 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60 sm:grid-cols-4">
              {[
                { label: "Projects", value: 150, suffix: "+" },
                { label: "Client Satisfaction", value: 98, suffix: "%" },
                { label: "Years", value: 5, suffix: "+" },
                { label: "Tech Stack", value: 25, suffix: "+" },
              ].map((s, i) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    <AnimatedCounter end={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center">
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                Scroll to explore
              </p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="h-6 w-6 text-slate-400" />
              </motion.div>
            </div>
          </div>
        </Container>
      </motion.section>

      {/* Tech marquee */}
      <section className="py-10">
        <Container>
          <TechMarquee />
        </Container>
      </section>

      {/* Features */}
      <section className="py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              What I Do
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Comprehensive services to ship fast, accessible, and maintainable
              products.
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                description={f.description}
                delay={i * 0.08}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Case studies */}
      <section className="bg-white py-20 dark:bg-slate-950">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recent Work
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              A snapshot of projects that improved performance and outcomes.
            </p>
          </div>
          <CaseStudies />
          <div className="mt-10 flex justify-center">
            <Link to="/services">
              <Button variant="cta-light">Explore Services</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="mb-4 text-4xl font-bold">Client Feedback</h2>
            <p className="opacity-90">
              Trusted by teams to deliver quality and speed.
            </p>
          </div>
          <Testimonials />
        </Container>
      </section>

      {/* CTA band */}
      <section className="py-16">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm dark:border-slate-800/70 dark:bg-slate-900 md:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
            />
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">
                Ready to Start Your Project?
              </h3>
              <p className="mb-8 text-slate-600 dark:text-slate-300">
                Let’s bring your vision to life with clean code and thoughtful
                design.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/contact">
                  <Button variant="cta-light">Get Started Today</Button>
                </Link>
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="cta-ghost">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule a Call
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;