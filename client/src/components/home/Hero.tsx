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
      {/* Background gradients */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full 
                     bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),transparent_60%)] blur-3xl"
          style={{ y: useTransform(scrollY, [0, 500], [0, 50]) }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-[40rem] w-[40rem] rounded-full 
                     bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.2),transparent_60%)] blur-3xl"
          style={{ y: useTransform(scrollY, [0, 500], [0, -30]) }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]" />
      </motion.div>

      <Container className="relative z-10 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Text Section */}
          <motion.div
            className="text-center md:text-left"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } }
            }}
          >
            {/* Tag */}
            <motion.span
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className={`mb-6 inline-flex items-center gap-2 ${TOKENS.radius.full} ${TOKENS.surfaceGlass} px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-200 dark:text-blue-200 dark:ring-slate-700`}
            >
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Now booking for Q3
            </motion.span>

            {/* Heading */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className={`mb-5 text-5xl font-extrabold leading-tight tracking-tight ${TOKENS.textHeading} md:text-6xl lg:text-7xl`}
            >
              Build Modern Web
              <span className="block bg-gradient-to-r from-blue-600 via-fuchsia-600 to-teal-500 bg-clip-text text-transparent">
                Experiences That Perform
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className={`mx-auto mb-8 max-w-xl ${TOKENS.textBody} md:mx-0 md:text-lg`}
            >
              From concept to launch, I craft fast, accessible products that
              look beautiful and drive measurable results.
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start"
            >
              <Link to="/contact" aria-label="Start your project">
                <Button variant="primary" className="group hover:scale-105 transition-transform">
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
                <Button variant="secondary" className="group hover:scale-105 transition-transform">
                  <Play className="mr-2 h-4 w-4" />
                  View Work
                </Button>
              </a>
            </motion.div>

            {/* Counters */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className={`mx-auto max-w-xl ${TOKENS.surfaceGlass} ${TOKENS.radius.lg} p-4 md:mx-0 backdrop-blur-md`}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Projects", value: 150, suffix: "+" },
                  { label: "Satisfaction", value: 98, suffix: "%" },
                  { label: "Years", value: 5, suffix: "+" },
                  { label: "Stack", value: 25, suffix: "+" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`text-xl font-bold ${TOKENS.textHeading}`} aria-label={`${s.value}${s.suffix} ${s.label}`}>
                      <AnimatedCounter end={s.value} suffix={s.suffix} />
                    </div>
                    <div className={`text-xs ${TOKENS.textMuted}`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tech logos */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="mt-8 flex items-center justify-center gap-4 md:justify-start"
            >
              {[
                { src: 'https://www.svgrepo.com/show/354512/vercel.svg', alt: 'Vercel' },
                { src: 'https://www.svgrepo.com/show/448299/aws.svg', alt: 'Amazon Web Services' },
                { src: 'https://www.svgrepo.com/show/521303/react-16.svg', alt: 'React' },
                { src: 'https://www.svgrepo.com/show/521320/typescript-16.svg', alt: 'TypeScript' }
              ].map((logo, i) => (
                <img
                  key={i}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-5 w-auto opacity-70 grayscale hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Preview */}
          <HeroPreview />
        </div>

        {/* Scroll Cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-col items-center"
        >
          <p className={`mb-2 text-sm ${TOKENS.textMuted}`}>Scroll to explore</p>
          {!reduce && (
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="animate-pulse"
            >
              <ChevronDown className="h-6 w-6 text-slate-400" />
            </motion.div>
          )}
        </motion.div>
      </Container>
    </motion.section>
  );
};
