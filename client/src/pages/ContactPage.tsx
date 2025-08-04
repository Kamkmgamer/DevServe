import Container from "../components/layout/Container";
import { ContactForm } from "../components/form/ContactForm";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";

const easeInOut = [0.42, 0, 0.58, 1] as const;

const FloatingBlobs = ({ reduce }: { reduce: boolean }) => {
  const blobs = useMemo(
    () => [
      { size: "h-72 w-72", className: "from-pink-500/30 to-yellow-400/30", x: "8%", y: "10%" },
      { size: "h-56 w-56", className: "from-indigo-500/30 to-cyan-400/30", x: "65%", y: "18%" },
      { size: "h-80 w-80", className: "from-emerald-400/25 to-teal-500/25", x: "18%", y: "65%" },
      { size: "h-64 w-64", className: "from-violet-500/25 to-fuchsia-500/25", x: "75%", y: "70%" },
    ],
    []
  );

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute ${b.size} rounded-[999px] blur-3xl bg-gradient-to-br ${b.className}`}
          style={{ left: b.x, top: b.y }}
          animate={
            reduce
              ? { x: 0, y: 0, opacity: 0.45 }
              : {
                  x: [0, i % 2 ? -12 : 12, 0],
                  y: [0, i % 3 ? 10 : -10, 0],
                  opacity: [0.35, 0.5, 0.35],
                }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 9 + i * 1.5, repeat: Infinity, ease: easeInOut }
          }
        />
      ))}
    </div>
  );
};

const ContactPage = () => {
  const reduce = !!useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-sky-50 dark:from-slate-950 dark:via-black dark:to-slate-950">
      {/* Colorful animated background accents */}
      <FloatingBlobs reduce={reduce} />

      {/* Floating colorful icon */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-14 -z-10 -translate-x-1/2"
        animate={
          reduce
            ? { y: 0, opacity: 0.18 }
            : { y: [0, -8, 0], opacity: [0.18, 0.28, 0.18] }
        }
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 3.2, repeat: Infinity, ease: easeInOut }
        }
      >
        <Sparkles size={112} className="text-fuchsia-400/60 dark:text-fuchsia-400/40" />
      </motion.div>

      <Container className="relative z-10 flex min-h-screen items-center justify-center py-24">
        <motion.div
          className="w-full max-w-2xl rounded-3xl border border-white/30 bg-white/70 p-8 shadow-2xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70"
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeInOut }}
        >
          {/* Animated gradient headline */}
          <motion.h1
            className="mb-3 text-center text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#22d3ee,#10b981,#6366f1)] bg-[length:200%_200%]"
            style={{ WebkitTextFillColor: "transparent" }}
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.1, duration: 0.5, ease: easeInOut }}
          >
            Let’s Connect
          </motion.h1>

          {/* Headline gradient animation */}
          <motion.div
            aria-hidden
            className="mx-auto mb-2 h-1 w-28 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400"
            animate={reduce ? { backgroundPositionX: "0%" } : { backgroundPositionX: ["0%", "100%", "0%"] }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 4.5, repeat: Infinity, ease: "linear" }
            }
            style={{
              backgroundSize: "200% 100%",
            }}
          />

          <motion.p
            className="mb-8 text-center text-lg text-slate-700 dark:text-slate-300"
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.2, duration: 0.45, ease: easeInOut }}
          >
            Whether it’s feedback, support, or collaboration, we’re here to talk.
          </motion.p>

          {/* Form entrance */}
          <motion.div
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.3, duration: 0.55, ease: easeInOut }}
          >
            <ContactForm />
          </motion.div>

          {/* Shimmer accent bar */}
          <div className="mt-8">
            <div className="relative mx-auto h-2 w-44 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent"
                animate={reduce ? { x: "40%" } : { x: ["-10%", "110%"] }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 2.4, repeat: Infinity, ease: easeInOut }
                }
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default ContactPage;