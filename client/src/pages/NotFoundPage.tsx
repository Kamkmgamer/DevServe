import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Home,
  PartyPopper,
  Zap,
  Stars,
  Flame,
  Rocket,
} from "lucide-react";
import { useSEO } from "../utils/useSEO";

/**
 * Micro confetti with extra spice: trails, fade, shockwave.
 */
function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const burst = useCallback((x?: number, y?: number, power = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const cx = x ?? rect.width / 2;
    const cy = y ?? rect.height / 2;

    const N = Math.floor(220 * power);
    const particles = Array.from({ length: N }, () => ({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      r: Math.random() * 2 + 2,
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() * 7 + 6) * power,
      life: Math.random() * 70 + 60,
      ttl: 0,
      color: `hsl(${Math.floor(Math.random() * 360)}, 90%, 60%)`,
      spin: (Math.random() - 0.5) * 0.35,
      drag: 0.985 - Math.random() * 0.01,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      trail: [] as { x: number; y: number }[],
    }));

    // Shockwave ring
    const ring = {
      r: 0,
      o: 0.5,
      alive: true,
    };

    let frame = 0;
    const animate = () => {
      if (!ctx || !canvas) return;
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Shockwave
      if (ring.alive) {
        ring.r += 8 * power;
        ring.o *= 0.96;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${ring.o})`;
        ctx.lineWidth = Math.max(1, 3 * power);
        ctx.stroke();
        if (ring.o < 0.03) ring.alive = false;
      }

      particles.forEach((p) => {
        // Integrate
        p.vx = Math.cos(p.angle) * p.speed;
        p.vy = Math.sin(p.angle) * p.speed + frame * 0.02; // gravity-ish
        p.speed *= p.drag;
        p.angle += p.spin;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.ttl++;

        // Trail
        if (p.ttl % 2 === 0) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 6) p.trail.shift();
        }

        // Trail draw
        for (let i = 0; i < p.trail.length - 1; i++) {
          const a = p.trail[i];
          const b = p.trail[i + 1];
          const t = i / p.trail.length;
          ctx.strokeStyle = p.color.replace(
            "hsl",
            "hsla"
          ).replace(")", `,${0.15 * (t + 0.2)})`);
          ctx.lineWidth = Math.max(1, p.r * (1 - t));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        // Particle
        ctx.save();
        const fade = Math.max(p.life / 90, 0);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.shape === "rect") {
          ctx.fillRect(-p.r, -p.r, p.r * 2.2, p.r * 2.2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (particles.some((p) => p.life > 0) || ring.alive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return { canvasRef, burst };
}

/**
 * Cursor comet trail.
 */
function useCursorComets() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let last = 0;
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last < 18) return; // a tad faster
      last = now;

      const dot = document.createElement("span");
      dot.className =
        "pointer-events-none absolute h-2 w-2 -translate-x-1/2 " +
        "-translate-y-1/2 rounded-full will-change-transform";
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      dot.style.background =
        "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0))";
      dot.style.boxShadow =
        "0 0 18px rgba(255,255,255,0.8), 0 0 48px rgba(59,130,246,0.7)";
      dot.style.opacity = "1";
      dot.style.transition = "transform 700ms ease, opacity 1000ms ease";
      container.appendChild(dot);

      requestAnimationFrame(() => {
        dot.style.transform =
          "translate(-50%, -50%) translateY(-32px) scale(0)";
        dot.style.opacity = "0";
      });

      setTimeout(() => {
        dot.remove();
      }, 1100);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return { containerRef };
}

const NotFoundPage = () => {
  useSEO("Kaboom! 404 | DevServe", [{ name: "robots", content: "noindex" }]);

  const navigate = useNavigate();
  const { canvasRef, burst } = useConfetti();
  const { containerRef } = useCursorComets();

  // Starfield
  const [stars] = useState(
    () =>
      Array.from({ length: 160 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 2.2 + 0.2,
        d: Math.random() * 5 + 3.5,
        o: Math.random() * 0.7 + 0.25,
      })) as { x: number; y: number; s: number; d: number; o: number }[]
  );

  // Floating particles (bigger and slower)
  const [particles] = useState(
    () =>
      Array.from({ length: 36 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 18 + 6,
        dur: Math.random() * 12 + 12,
        delay: Math.random() * 6,
        hue: Math.floor(Math.random() * 360),
      })) as {
        x: number;
        y: number;
        size: number;
        dur: number;
        delay: number;
        hue: number;
      }[]
  );

  // Shooting stars
  const [shooters] = useState(
    () =>
      Array.from({ length: 6 }, () => ({
        key: Math.random().toString(36).slice(2),
        delay: Math.random() * 6,
        top: Math.random() * 40 + 5, // 5% - 45%
      })) as { key: string; delay: number; top: number }[]
  );

  const emojiRing = ["🔥", "🚀", "✨", "🌈", "💥", "🧨", "🦄", "🎉", "💫", "🌟"];

  // Typewriter
  const message = useMemo(
    () =>
      "This page self-destructed in a blaze of neon glory. Welcome to the void.",
    []
  );
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = prefersReduced ? 0 : 16;
    const id = setInterval(() => {
      setTyped(message.slice(0, i));
      i++;
      if (i > message.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [message]);

  // Parallax for headline + camera sway
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const title = titleRef.current;
    const stage = stageRef.current;
    if (!title || !stage) return;
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const onMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const mx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const my = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      title.style.transform =
        `translate3d(${mx * 14}px, ${my * 14}px, 0) rotateX(${my * -4}deg) ` +
        `rotateY(${mx * 8}deg)`;
      stage.style.setProperty("--camX", `${mx * 2}deg`);
      stage.style.setProperty("--camY", `${my * -2}deg`);
    };
    const onLeave = () => {
      title.style.transform = `translate3d(0,0,0) rotateX(0) rotateY(0)`;
      stage.style.setProperty("--camX", `0deg`);
      stage.style.setProperty("--camY", `0deg`);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Keyboard shortcuts: H -> home, B -> black hole
  const [vortex, setVortex] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") navigate("/");
      if (e.key.toLowerCase() === "b") setVortex((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Magnetic main button + glow
  const btnRef = useRef<HTMLAnchorElement | null>(null);
  const onMagnetic = (e: ReactMouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 28;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 28;
    el.style.transform =
      `translate3d(${x}px, ${y}px, 0) rotateX(${-y / 4}deg) rotateY(${x / 4}deg)`;
  };
  const onMagneticLeave = () => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = `translate3d(0,0,0) rotateX(0deg) rotateY(0deg)`;
  };
  const glowRef = useRef<HTMLSpanElement | null>(null);
  const onPointerGlow = (e: ReactMouseEvent) => {
    const g = glowRef.current;
    if (!g) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    g.style.setProperty("--x", `${e.clientX - rect.left}px`);
    g.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  // Launch a burst on mount (gentle)
  useEffect(() => {
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) setTimeout(() => burst(undefined, undefined, 0.7), 250);
  }, [burst]);

  return (
    <main
      ref={stageRef}
      className={
        "relative isolate min-h-[calc(100vh-64px-64px)] overflow-hidden " +
        "bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 " +
        (vortex ? "vortex" : "")
      }
      style={{
        perspective: "1000px",
        transform:
          "translateZ(0) rotateX(var(--camX, 0deg)) rotateY(var(--camY, 0deg))",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Cursor comet container */}
      <div ref={containerRef} className="pointer-events-none absolute inset-0" />

      {/* Nebula noise layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-90"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(56,189,248,0.12), transparent 60%), " +
            "radial-gradient(110% 100% at 80% 20%, rgba(168,85,247,0.10), transparent 60%), " +
            "radial-gradient(100% 100% at 20% 60%, rgba(244,63,94,0.10), transparent 60%)",
          filter: "saturate(1.2)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.03) 0deg 10deg, transparent 10deg 20deg)",
          mixBlendMode: "soft-light",
          animation: "nebulaSpin 40s linear infinite",
        }}
      />

      {/* Starfield */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-slate-300/70 shadow-[0_0_10px_rgba(255,255,255,0.6)] dark:bg-white/70"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              opacity: s.o,
              animation: `twinkle ${s.d}s ease-in-out infinite`,
              animationDelay: `${(i % 10) * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0 overflow-hidden">
        {shooters.map((s, i) => (
          <span
            key={s.key}
            className="absolute h-px w-40 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
            style={{
              top: `${s.top}%`,
              left: "-10%",
              filter:
                "drop-shadow(0 0 10px rgba(255,255,255,0.6)) drop-shadow(0 0 20px rgba(59,130,246,0.6))",
              animation: `shoot 3.6s ease-in-out ${s.delay + i * 1.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Aurora gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(60%_60%_at_50%_40%,rgba(59,130,246,0.22),transparent_60%),radial-gradient(50%_50%_at_70%_60%,rgba(236,72,153,0.20),transparent_60%),radial-gradient(40%_40%_at_30%_70%,rgba(34,197,94,0.16),transparent_60%)] dark:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block bg-[radial-gradient(65%_75%_at_50%_-20%,rgba(59,130,246,0.12),transparent_70%),radial-gradient(45%_55%_at_80%_80%,rgba(236,72,153,0.10),transparent_70%)] dark:hidden"
      />

      {/* Floating colorful blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full opacity-40 blur-[6px] mix-blend-multiply dark:mix-blend-screen"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: `hsl(${p.hue}deg 80% 60%)`,
              animation: `floatY ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
              filter: "saturate(1.2)",
            }}
          />
        ))}
      </div>

      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Cyber grid floor + scan sweep */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent dark:from-black/80 dark:via-black/20" />
        <div
          className="absolute inset-0 opacity-80 [transform:perspective(900px)_rotateX(62deg)_translateY(38%)] [transform-origin:bottom_center]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.28) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(99,102,241,0.28) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            backgroundPosition: "center center",
            boxShadow:
              "inset 0 0 60px rgba(59,130,246,0.25), 0 0 80px rgba(59,130,246,0.2)",
          }}
        />
        <div
          className="absolute inset-0 [transform:perspective(900px)_rotateX(62deg)_translateY(38%)] [transform-origin:bottom_center]"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)",
            maskImage:
              "linear-gradient(90deg, transparent, black 40%, black 60%, transparent)",
            animation: "scan 6s linear infinite",
          }}
        />
        <div
          className="absolute inset-0 [transform:perspective(900px)_rotateX(62deg)_translateY(38%)] [transform-origin:bottom_center]"
          style={{
            background:
              "radial-gradient(40% 60% at 50% 100%, rgba(99,102,241,0.15), transparent 60%)",
            animation: "pulse 5.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:py-20 md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/60 bg-white/70 px-3 py-1 text-xs text-slate-700 ring-1 ring-black/5 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-white/5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          Ultra-Pretty 404 Mode: Overclocked
        </div>

        {/* Orbital emojis and 3D headline */}
        <div className="relative mt-8 grid place-items-center">
          <h1
            ref={titleRef}
            className="relative z-10 text-6xl font-extrabold tracking-tight md:text-7xl"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.5)",
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.95), rgba(255,255,255,0.2))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              textShadow:
                "0 0 24px rgba(99,102,241,0.6), 0 0 48px rgba(236,72,153,0.35)",
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.25))",
              transformStyle: "preserve-3d",
            }}
          >
            404
            <span
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-1 block h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)",
                boxShadow:
                  "0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(99,102,241,0.4)",
                animation: "scanline 2.2s linear infinite",
              }}
            />
          </h1>

          <div className="pointer-events-none absolute inset-0 -z-0">
            {emojiRing.map((em, i) => (
              <span
                key={i}
                className="absolute select-none text-2xl md:text-3xl"
                style={{
                  left: "50%",
                  top: "50%",
                  transformOrigin: "0 -140px",
                  transform: `translate(-50%,-50%) rotate(${
                    (360 / emojiRing.length) * i
                  }deg)`,
                  animation: `orbit 10s linear infinite`,
                  animationDelay: `${i * 0.16}s`,
                  filter:
                    "drop-shadow(0 0 6px rgba(255,255,255,0.6)) drop-shadow(0 0 16px rgba(236,72,153,0.5))",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: "rotate(-90deg)",
                  }}
                >
                  {em}
                </span>
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-lg text-slate-600 md:text-xl dark:text-slate-300">
          {typed || "\u00A0"}
        </p>

        {/* Fancy buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            ref={btnRef}
            to="/"
            onMouseMove={(e) => {
              onMagnetic(e);
              onPointerGlow(e);
            }}
            onMouseLeave={onMagneticLeave}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(59,130,246,0.7)] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] dark:border-blue-400/40"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.1), 0 10px 40px -10px rgba(59,130,246,0.7)",
              filter:
                "drop-shadow(0 0 10px rgba(59,130,246,0.6)) drop-shadow(0 0 24px rgba(59,130,246,0.4))",
            }}
          >
            <span
              ref={glowRef}
              className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(140px 100px at var(--x,50%) var(--y,50%), rgba(255,255,255,0.28), transparent 60%)",
              }}
            />
            <Home className="h-5 w-5" />
            Go Home
            <span
              aria-hidden="true"
              className="ml-1 inline-flex items-center rounded bg-white/25 px-1.5 py-0.5 text-[10px] font-medium dark:bg-white/20"
              title="Press H"
            >
              H
            </span>
          </Link>

          <button
            type="button"
            onClick={(e) => {
              const rect =
                (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
              burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.1);
            }}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-pink-500/40 bg-gradient-to-br from-pink-600 to-rose-600 px-6 py-3 text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(244,63,94,0.7)] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] dark:border-pink-400/40"
            style={{
              filter:
                "drop-shadow(0 0 10px rgba(244,63,94,0.6)) drop-shadow(0 0 24px rgba(244,63,94,0.4))",
            }}
          >
            <PartyPopper className="h-5 w-5" />
            Explode Confetti
            <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(255,255,255,0.25),transparent_30%)] blur-[10px]" />
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              const rect =
                (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
              burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.6);
            }}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(245,158,11,0.7)] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] dark:border-amber-400/40"
            style={{
              filter:
                "drop-shadow(0 0 10px rgba(245,158,11,0.6)) drop-shadow(0 0 24px rgba(245,158,11,0.4))",
            }}
          >
            <Zap className="h-5 w-5" />
            Bigger Boom
          </button>
        </div>

        {/* Info chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 bg-white/70 px-2.5 py-1 text-slate-600 ring-1 ring-black/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-white/5">
            <Stars className="h-3.5 w-3.5" /> Parallax
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 bg-white/70 px-2.5 py-1 text-slate-600 ring-1 ring-black/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-white/5">
            <Flame className="h-3.5 w-3.5" /> Confetti++
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 bg-white/70 px-2.5 py-1 text-slate-600 ring-1 ring-black/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-white/5">
            <Rocket className="h-3.5 w-3.5" /> Comet Trail
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 bg-white/70 px-2.5 py-1 text-slate-600 ring-1 ring-black/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-white/5">
            💥 Laser Grid
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 bg-white/70 px-2.5 py-1 text-slate-600 ring-1 ring-black/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-white/5">
            🌀 Black Hole (B)
          </span>
        </div>
      </section>

      {/* Bottom glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-slate-950 dark:via-slate-950/60" />

      {/* Animations */}
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-46px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes orbit {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes nebulaSpin {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes scan {
          0% { transform: translateX(-60%); }
          100% { transform: translateX(60%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes scanline {
          0% { opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { opacity: 0.2; }
        }
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0) rotate(12deg); opacity: 0; }
          10% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(140vw) translateY(-20vh) rotate(12deg); opacity: 0; }
        }
        .vortex {
          animation: vortexSpin 0.8s ease-out both;
          transform-origin: center center;
          filter: saturate(1.3) contrast(1.1);
        }
        @keyframes vortexSpin {
          0% { transform: scale(1) rotate(0deg); filter: blur(0px); }
          60% { transform: scale(0.9) rotate(8deg); filter: blur(1px); }
          100% { transform: scale(1) rotate(0deg); filter: blur(0px); }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
};

export default NotFoundPage;