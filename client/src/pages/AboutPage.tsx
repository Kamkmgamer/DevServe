import { useEffect } from "react";
import {
  motion,
  useReducedMotion,
  Variants,
  Transition,
} from "framer-motion";
import { useSEO } from "../utils/useSEO";

const easeBezier: Transition["ease"] = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeBezier, delay },
  },
});

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const glow =
  "before:absolute before:inset-0 before:-z-10 before:rounded-2xl " +
  "before:bg-gradient-to-tr before:from-indigo-500/20 before:to-cyan-400/10 " +
  "before:blur-2xl";

const AboutPage = () => {
  useSEO("About | DevServe", [
    {
      name: "description",
      content:
        "Discover DevServe’s story, the values we stand by, and the minds behind our mission to empower digital creators and modern businesses.",
    },
  ]);

  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // placeholder: respect reduced motion for any imperative animations
  }, [prefersReduced]);

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
      {/* Ambient gradient background (pure CSS, no images) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-400/10 to-transparent blur-3xl" />
        <div className="absolute right-[-10%] top-[30%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-fuchsia-500/10 to-indigo-500/10 blur-3xl" />
      </div>

      {/* Hero */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        className="relative"
      >
        <motion.div
          variants={fadeUp(0)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Built by creators, for creators
        </motion.div>

        <motion.h1
          variants={fadeUp(0.05)}
          className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl"
        >
          Meet DevServe
        </motion.h1>

        <motion.p
          variants={fadeUp(0.1)}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-700 dark:text-slate-400"
        >
          DevServe isn’t just a platform — it’s a movement. We blend modern
          design, smart code, and practical tools to help startups, teams, and
          solo builders turn vision into velocity.
        </motion.p>

        <motion.div
          variants={fadeUp(0.15)}
          className="relative mt-8 inline-block"
        >
          <div className="h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
        </motion.div>
      </motion.section>

      {/* Feature cards */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3"
      >
        <motion.article
          variants={fadeUp(0)}
          whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
          className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-colors dark:border-slate-800 dark:bg-slate-900 ${glow}`}
        >
          <div className="absolute right-[-20%] top-[-20%] h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl transition-opacity group-hover:opacity-70" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Our Mission
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Empower developers and entrepreneurs with beautifully engineered
            tools that accelerate growth and creativity — minus the complexity.
          </p>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors group-hover:text-indigo-500 dark:text-indigo-400">
            Learn more
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M12.293 4.293a1 1 0 011.414 0l4 4a.997.997 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 10H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
            </svg>
          </div>
        </motion.article>

        <motion.article
          variants={fadeUp(0.05)}
          whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
          className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-colors dark:border-slate-800 dark:bg-slate-900 ${glow}`}
        >
          <div className="absolute left-[-10%] top-[-20%] h-44 w-44 rounded-full bg-sky-400/10 blur-2xl transition-opacity group-hover:opacity-70" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Core Values
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {[
              "Creator-first mindset",
              "Radical transparency",
              "Fast, focused execution",
              "Design meets functionality",
              "Community over competition",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 leading-6">
                <svg
                  className="mt-1 h-4 w-4 flex-none text-emerald-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8.5 11.586l6.543-6.543a1 1 0 011.664.25z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article
          variants={fadeUp(0.1)}
          whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
          className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-colors dark:border-slate-800 dark:bg-slate-900 ${glow}`}
        >
          <div className="absolute bottom-[-20%] right-[-10%] h-44 w-44 rounded-full bg-fuchsia-400/10 blur-2xl transition-opacity group-hover:opacity-70" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            The Team
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            We’re a lean, remote-first team of developers, designers, and
            strategists. Every line of code and pixel we ship is crafted with
            intention — and we use our own products every day.
          </p>

          {/* Replaced avatar images with animated initials badges (pure CSS) */}
          <div className="mt-6 flex -space-x-3">
            {["AL", "RM", "KS", "JT"].map((initials) => (
              <div
                key={initials}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-sky-400 text-xs font-bold text-white shadow-sm ring-0 transition-all dark:border-slate-900"
                title={`Team member ${initials}`}
              >
                {initials}
              </div>
            ))}
          </div>
        </motion.article>
      </motion.section>

      {/* Statement with subtle animated accent */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mt-16 md:mt-20"
      >
        <motion.div
          variants={fadeUp(0)}
          className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/70 p-8 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"
          />
          <p className="mx-auto max-w-3xl text-base leading-7 text-slate-700 dark:text-slate-400">
            Whether you're building your first MVP or scaling to millions —{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              DevServe is here to power your journey.
            </span>
          </p>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative h-8 w-56 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                animate={{ x: ["-10%", "110%"] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0"
              />
            </div>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
};

export default AboutPage;