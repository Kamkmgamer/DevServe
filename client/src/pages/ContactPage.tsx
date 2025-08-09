import Container from "../components/layout/Container";
import { ContactForm } from "../components/form/ContactForm";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";

const easeInOut = [0.42, 0, 0.58, 1] as const;

const FloatingBlobs = ({ reduce, mouse }: { reduce: boolean; mouse: { x: number; y: number } }) => {
  const blobs = useMemo(
    () => [
      { size: "h-72 w-72", className: "from-pink-500/30 to-yellow-400/30", x: "8%", y: "10%", speed: 0.02 },
      { size: "h-56 w-56", className: "from-indigo-500/30 to-cyan-400/30", x: "65%", y: "18%", speed: 0.03 },
      { size: "h-80 w-80", className: "from-emerald-400/25 to-teal-500/25", x: "18%", y: "65%", speed: 0.015 },
      { size: "h-64 w-64", className: "from-violet-500/25 to-fuchsia-500/25", x: "75%", y: "70%", speed: 0.025 },
    ],
    []
  );

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute ${b.size} rounded-full blur-3xl bg-gradient-to-br ${b.className}`}
          style={{
            left: `calc(${b.x} + ${mouse.x * b.speed}px)`,
            top: `calc(${b.y} + ${mouse.y * b.speed}px)`,
          }}
          animate={
            reduce
              ? { opacity: 0.45 }
              : {
                  x: [0, i % 2 ? -20 : 20, 0],
                  y: [0, i % 3 ? 15 : -15, 0],
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                  opacity: [0.35, 0.5, 0.35],
                }
          }
          transition={
            reduce ? { duration: 0 } : { duration: 12 + i * 1.5, repeat: Infinity, ease: easeInOut }
          }
        />
      ))}
    </div>
  );
};

// Smooth trail that actually follows the cursor
const SparkleTrail = ({ mouse, reduce }: { mouse: { x: number; y: number }; reduce: boolean }) => {
  const count = 8;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        // offset each particle so trail looks staggered
        const offsetX = i * 10;
        const offsetY = i * 6;
        const opacityStart = Math.max(0.9 - i * 0.11, 0.15);
        const scaleStart = Math.max(1 - i * 0.06, 0.6);

        return (
          <motion.div
            key={i}
            // pointerEvents none so it never blocks clicks
            className="absolute h-2 w-2 rounded-full bg-fuchsia-400/70 pointer-events-none"
            style={{
              // center the particle visually
              translate: "-50% -50%",
              left: 0,
              top: 0,
            }}
            // animate x/y using transforms so Framer Motion does smooth motion
            animate={
              reduce
                ? { x: mouse.x - offsetX, y: mouse.y - offsetY, opacity: opacityStart, scale: scaleStart }
                : { x: mouse.x - offsetX, y: mouse.y - offsetY, opacity: [opacityStart, 0], scale: [scaleStart, 1.15] }
            }
            transition={
              reduce
                ? { duration: 0 }
                : {
                    // spring for natural trailing behavior, slightly softer as index increases
                    type: "spring",
                    stiffness: 500 - i * 30,
                    damping: 28,
                    mass: 0.2 + i * 0.02,
                  }
            }
          />
        );
      })}
    </>
  );
};

// Click ripple glow
const ClickRipple = ({ clicks }: { clicks: { id: number; x: number; y: number }[] }) => (
  <>
    {clicks.map((c) => (
      <motion.div
        key={c.id}
        className="absolute rounded-full bg-fuchsia-400/28 pointer-events-none"
        style={{
          left: c.x,
          top: c.y,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ width: 0, height: 0, opacity: 0.5 }}
        animate={{ width: 220, height: 220, opacity: 0 }}
        transition={{ duration: 0.7, ease: easeInOut }}
      />
    ))}
  </>
);

const ContactPage = () => {
  const reduce = !!useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [gradientShift, setGradientShift] = useState(0);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // set an initial center position after mount
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouse({ x: rect.width / 2, y: rect.height / 2 });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // coordinates relative to container
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const click = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setClicks((prev) => [...prev, click]);
      // cleanup ripple after animation
      setTimeout(() => {
        setClicks((prev) => prev.filter((p) => p.id !== click.id));
      }, 800);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-sky-50 dark:from-slate-950 dark:via-black dark:to-slate-950"
    >
      <FloatingBlobs reduce={reduce} mouse={{ x: mouse.x - (containerRef.current?.clientWidth ?? 0) / 2, y: mouse.y - (containerRef.current?.clientHeight ?? 0) / 2 }} />

      <SparkleTrail mouse={mouse} reduce={reduce} />
      <ClickRipple clicks={clicks} />

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-14 -z-10 -translate-x-1/2"
        animate={reduce ? { y: 0, opacity: 0.18 } : { y: [0, -8, 0], rotate: [0, 3, -3, 0], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: easeInOut }}
      >
        <Sparkles size={112} className="text-fuchsia-400/60 dark:text-fuchsia-400/40" />
      </motion.div>

      <Container className="relative z-10 flex min-h-screen items-center justify-center py-24">
        <motion.div
          className="w-full max-w-2xl rounded-3xl border border-white/30 bg-white/70 dark:border-slate-800/60 dark:bg-slate-900/70 p-8 shadow-[0_0_40px_rgba(236,72,153,0.2)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeInOut }}
        >
          <motion.h1
            className="mb-3 text-center text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#22d3ee,#10b981,#6366f1)] bg-[length:200%_200%] drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]"
            style={{ WebkitTextFillColor: "transparent", backgroundPosition: `${gradientShift}% 50%` }}
            animate={{ backgroundPosition: [`${gradientShift}% 50%`, `${(gradientShift + 50) % 100}% 50%`] }}
            transition={{ duration: 3, repeat: Infinity, ease: easeInOut }}
          >
            Let’s Connect
          </motion.h1>

          <motion.div aria-hidden className="mx-auto mb-2 h-1 w-28 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400"
            animate={{ backgroundPositionX: ["0%", "100%", "0%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 100%" }}
          />

          <motion.p className="mb-8 text-center text-lg text-slate-700 dark:text-slate-300" animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.45, ease: easeInOut }}>
            Whether it’s feedback, support, or collaboration, we’re here to talk.
          </motion.p>

          <div onInput={() => setGradientShift((prev) => (prev + 5) % 100)}>
            <ContactForm />
          </div>

          <div className="mt-8">
            <div className="relative mx-auto h-2 w-44 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent"
                animate={{ x: ["-30%", "130%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: easeInOut }}
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default ContactPage;
