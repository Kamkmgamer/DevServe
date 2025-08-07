import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Sparkles, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Container from '../layout/Container';
import { TOKENS, useReducedMotionPref } from '../../utils/tokens';
import { HeroPreview } from './HeroPreview';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export const Hero = () => {
  const reduce = useReducedMotionPref();
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 300], [0, reduce ? 0 : -60]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, reduce ? 1 : 0.9]);

  return (
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
                href="https://khalils-portfolio.vercel.app/"
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
                src="https://www.svgrepo.com/show/354512/vercel.svg"
                alt="Vercel"
                width={80}
                height={20}
                className="h-5 w-auto opacity-70 grayscale"
                loading="lazy"
              />
              <img
                src="https://www.svgrepo.com/show/448299/aws.svg"
                alt="Amazon Web Services"
                width={60}
                height={20}
                className="h-5 w-auto opacity-70 grayscale"
                loading="lazy"
              />
              <img
                src="https://www.svgrepo.com/show/521303/react-16.svg"
                alt="React"
                width={60}
                height={20}
                className="h-5 w-auto opacity-70 grayscale"
                loading="lazy"
              />
              <img
                src="https://www.svgrepo.com/show/521320/typescript-16.svg"
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
  );
};
