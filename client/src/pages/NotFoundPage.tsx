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
  ShieldAlert,
  Atom,
  Keyboard, // New Icon!
} from "lucide-react";
import { useSEO } from "../utils/useSEO";

/**
 * Supernova Explosion Engine v2.1
 * Now accepts an `enabled` prop to be toggled.
 */
function useSupernovaExplosion({ enabled = true }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isShaking, setShaking] = useState(false);

  const triggerScreenShake = useCallback(() => {
    if (!enabled) return;
    setShaking(true);
    setTimeout(() => setShaking(false), 500); // Shake duration
  }, [enabled]);

  const supernova = useCallback(
    (x?: number, y?: number, power = 1) => {
      if (!enabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      triggerScreenShake();

      const rect = canvas.getBoundingClientRect();
      const cx = x ?? rect.width / 2;
      const cy = y ?? rect.height / 2;

      const N = Math.floor(400 * power);
      const particles = Array.from({ length: N }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() ** 2 * 12 + 8) * power;
        const life = Math.random() * 80 + 80;
        const shapeType = Math.random();

        return {
          x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          r: Math.random() * 3 + 2, angle: Math.random() * Math.PI * 2,
          speed: speed, life: life, ttl: life,
          color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 75%)`,
          spin: (Math.random() - 0.5) * 0.45, drag: 0.96 - Math.random() * 0.02,
          shape: shapeType > 0.9 ? "star" : shapeType > 0.6 ? "line" : shapeType > 0.3 ? "rect" : "circle",
          trail: [] as { x: number; y: number }[],
        };
      });

      const ring = { r: 0, o: 0.8, alive: true, color: `hsl(${Math.random() * 360}, 100%, 70%)` };

      let frame = 0;
      const animate = () => {
        if (!ctx || !canvas) return;
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Chromatic Aberration & Shockwave
        if (ring.alive) {
          ring.r += 12 * power;
          ring.o *= 0.94;
          ctx.globalCompositeOperation = "lighter";
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 0, 0, ${ring.o * 0.5})`;
          ctx.lineWidth = Math.max(1, 6 * power * ring.o);
          ctx.stroke();
          ctx.strokeStyle = `rgba(0, 255, 255, ${ring.o * 0.5})`;
          ctx.lineWidth = Math.max(1, 6 * power * ring.o);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
          if (ring.o < 0.01) ring.alive = false;
        }

        particles.forEach((p, i) => {
          if (p.life <= 0) return;
          p.vy += 0.098;
          p.speed *= p.drag;
          p.vx = Math.cos(p.angle) * p.speed;
          p.vy += frame * 0.002 * power;
          p.angle += p.spin;
          p.x += p.vx;
          p.y += p.vy;
          p.life--;

          if (i % 2 === 0) {
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 7) p.trail.shift();
          }

          const fade = Math.max(p.life / p.ttl, 0);
          ctx.globalAlpha = fade;

          if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let j = 1; j < p.trail.length; j++) {
              const t = j / p.trail.length;
              ctx.strokeStyle = p.color.replace("hsl", "hsla").replace(")", `,${0.1 * (t + 0.1) * fade})`);
              ctx.lineWidth = Math.max(0.5, p.r * (1 - t) * 1.5);
              ctx.lineTo(p.trail[j].x, p.trail[j].y);
            }
            ctx.stroke();
          }
          
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          switch (p.shape) {
            case "rect": ctx.fillRect(-p.r, -p.r, p.r * 2.5, p.r * 1.5); break;
            case "line": ctx.fillRect(-p.r * 2, -p.r * 0.25, p.r * 4, p.r * 0.5); break;
            case "star":
              ctx.beginPath();
              for (let j = 0; j < 5; j++) {
                ctx.lineTo(Math.cos((18 + j * 72) / 180 * Math.PI) * p.r * 2, -Math.sin((18 + j * 72) / 180 * Math.PI) * p.r * 2);
                ctx.lineTo(Math.cos((54 + j * 72) / 180 * Math.PI) * p.r, -Math.sin((54 + j * 72) / 180 * Math.PI) * p.r);
              }
              ctx.closePath();
              ctx.fill();
              break;
            default:
              ctx.beginPath();
              ctx.arc(0, 0, p.r, 0, Math.PI * 2);
              ctx.fill();
              break;
          }
          ctx.restore();
        });

        ctx.globalAlpha = 1.0;
        if (particles.some((p) => p.life > 0) || ring.alive) {
          requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      animate();
    },
    [triggerScreenShake, enabled]
  );

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

  return { canvasRef, supernova, isShaking };
}

/**
 * Cosmic Cursor v1.6
 * Now accepts an `enabled` prop to be toggled.
 */
function useCosmicCursor({ enabled = true }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let last = 0;
    const onMove = (e: MouseEvent) => {
      if (!enabled) return;
      const now = performance.now();
      if (now - last < 16) return;
      last = now;

      const count = 2;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("div");
        const size = Math.random() * 5 + 3;
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;

        dot.className = "pointer-events-none absolute rounded-full will-change-transform";
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${e.clientX + offsetX}px`;
        dot.style.top = `${e.clientY + offsetY}px`;
        dot.style.background = `radial-gradient(circle, hsl(${200 + Math.random() * 40}, 100%, 80%) 0%, transparent 80%)`;
        dot.style.filter = "blur(2px) brightness(1.5)";
        dot.style.opacity = "1";
        dot.style.transition = `transform ${700 + Math.random() * 300}ms ease-out, opacity ${800 + Math.random() * 400}ms ease-out`;
        container.appendChild(dot);

        requestAnimationFrame(() => {
          const finalX = (Math.random() - 0.5) * 40;
          const finalY = (Math.random() - 0.5) * 40 - 32;
          dot.style.transform = `translate(${finalX}px, ${finalY}px) scale(0)`;
          dot.style.opacity = "0";
        });

        setTimeout(() => {
          dot.remove();
        }, 1200);
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled]);

  return { containerRef };
}


const NotFoundPage = () => {
  useSEO("404: Cosmic Singularity | DevServe", [{ name: "robots", content: "noindex" }]);

  const navigate = useNavigate();
  
  // --- Central State for All Toggleable Features ---
  const [features, setFeatures] = useState({
    supernova: true,
    cosmicCursor: true,
    parallax: true,
    starfield: true,
    shootingStars: true,
    floatingDust: true,
    gridFloor: true,
    glitchText: true,
    orbitalEmojis: true,
    magneticButton: true,
    typewriter: true,
    backgroundNebula: true,
    scanlines: true,
    blackHole: true,
  });

  const { canvasRef, supernova, isShaking } = useSupernovaExplosion({ enabled: features.supernova });
  const { containerRef: cosmicCursorRef } = useCosmicCursor({ enabled: features.cosmicCursor });

  // 3D Parallax Starfield
  const [stars] = useState(() =>
    Array.from({ length: 200 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100, s: Math.random() * 1.8 + 0.2,
      d: Math.random() * 6 + 4, o: Math.random() * 0.6 + 0.2, parallax: Math.random() * 0.4 + 0.1,
    }))
  );

  // Floating Particles
  const [particles] = useState(() =>
    Array.from({ length: 40 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 22 + 8,
      dur: Math.random() * 15 + 15, delay: Math.random() * 8, hue: Math.floor(Math.random() * 360),
    }))
  );

  // Hyper-speed Shooting Stars
  const [shooters] = useState(() =>
    Array.from({ length: 8 }, () => ({
      key: Math.random().toString(36).slice(2), delay: Math.random() * 8,
      top: Math.random() * 60 + 5, dur: Math.random() * 2 + 2.5,
    }))
  );

  const emojiRing = ["🔥", "🚀", "✨", "🌌", "💥", "🪐", "🦄", "👾", "💫", "🌟", "☄️", "👽"];

  // Glitched Typewriter
  const message = useMemo(() => "This page hasn't just been lost; it has achieved glorious, explosive transcendence.", []);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !features.typewriter) {
      setTyped(message);
      return;
    }
    const id = setInterval(() => {
      setTyped(message.slice(0, i) + (Math.random() > 0.95 ? "█" : ""));
      i++;
      if (i > message.length) {
        setTyped(message);
        clearInterval(id);
      }
    }, 25);
    return () => clearInterval(id);
  }, [message, features.typewriter]);

  // Parallax Engine for Headline + Camera Sway
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const starfieldRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const title = titleRef.current;
    const stage = stageRef.current;
    const stars = starfieldRef.current;
    if (!title || !stage || !stars || !features.parallax) {
        // Reset styles if parallax is disabled
        if(title) title.style.transform = `translate3d(0,0,0) rotateX(0) rotateY(0)`;
        if(stage) {
            stage.style.setProperty("--camX", `0deg`);
            stage.style.setProperty("--camY", `0deg`);
        }
        if(stars) {
            stars.style.setProperty("--mouseX", `0px`);
            stars.style.setProperty("--mouseY", `0px`);
        }
        return;
    }
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const onMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const mx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const my = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      title.style.transform = `translate3d(${mx * 16}px, ${my * 16}px, 0) rotateX(${my * -6}deg) rotateY(${mx * 10}deg)`;
      stage.style.setProperty("--camX", `${mx * 2.5}deg`);
      stage.style.setProperty("--camY", `${my * -2.5}deg`);
      stars.style.setProperty("--mouseX", `${-mx * 100}px`);
      stars.style.setProperty("--mouseY", `${-my * 100}px`);
    };
    const onLeave = () => {
      title.style.transform = `translate3d(0,0,0) rotateX(0) rotateY(0)`;
      stage.style.setProperty("--camX", `0deg`);
      stage.style.setProperty("--camY", `0deg`);
      stars.style.setProperty("--mouseX", `0px`);
      stars.style.setProperty("--mouseY", `0px`);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [features.parallax]);
  
  // --- Keyboard Control Center ---
  const [vortex, setVortex] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // Hide help panel after a delay
  useEffect(() => {
    const timer = setTimeout(() => setShowHelp(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFeature = useCallback((featureName: keyof typeof features) => {
    setFeatures(current => ({ ...current, [featureName]: !current[featureName] }));
  }, []);

  const featureKeyMap: Record<string, keyof typeof features> = useMemo(() => ({
      '1': 'supernova', '2': 'cosmicCursor', '3': 'parallax',
      '4': 'starfield', '5': 'shootingStars', '6': 'floatingDust',
      '7': 'gridFloor', '8': 'glitchText', '9': 'orbitalEmojis',
      '0': 'magneticButton', '-': 'typewriter', '=': 'backgroundNebula'
  }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (featureKeyMap[key]) {
        e.preventDefault();
        toggleFeature(featureKeyMap[key]);
      } else if (key === "k") {
        setShowHelp(s => !s);
      } else if (key === "h") {
        navigate("/");
      } else if (key === "b" && features.blackHole) {
        setVortex(true);
        setTimeout(() => setVortex(false), 2000);
      } else if (key === "g" && features.supernova) {
        supernova(window.innerWidth / 2, window.innerHeight / 2, 3.0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, supernova, toggleFeature, featureKeyMap, features.blackHole, features.supernova]);

  // Magnetic Button Physics
  const btnRef = useRef<HTMLAnchorElement | null>(null);
  const onMagnetic = (e: ReactMouseEvent) => {
    if (!features.magneticButton) return;
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 35;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 35;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) rotateX(${-y / 3}deg) rotateY(${x / 3}deg)`;
  };
  const onMagneticLeave = () => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = `translate3d(0,0,0) rotateX(0deg) rotateY(0deg)`;
  };
  const glowRef = useRef<HTMLSpanElement | null>(null);
  const onPointerGlow = (e: ReactMouseEvent) => {
    if (!features.magneticButton) return;
    const g = glowRef.current;
    if (!g) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    g.style.setProperty("--x", `${e.clientX - rect.left}px`);
    g.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  // Initial supernova burst
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) setTimeout(() => supernova(undefined, undefined, 0.8), 300);
  }, [supernova]);

  return (
    <main
      ref={stageRef}
      className={`relative isolate min-h-[calc(100vh-128px)] overflow-hidden bg-slate-950 text-slate-100 ${isShaking ? "shake" : ""} ${vortex ? "vortex-active" : ""}`}
      style={{ perspective: "1200px", transform: "translateZ(0) rotateX(var(--camX, 0deg)) rotateY(var(--camY, 0deg))", transformStyle: "preserve-3d" }}
    >
      {features.cosmicCursor && <div ref={cosmicCursorRef} className="pointer-events-none absolute inset-0 z-50" />}

      {features.backgroundNebula && <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-plus-lighter opacity-80" style={{ background: "radial-gradient(120% 100% at 50% 0%, rgba(56,189,248,0.15), transparent 50%), radial-gradient(110% 100% at 80% 20%, rgba(192,132,252,0.12), transparent 50%), radial-gradient(100% 100% at 20% 60%, rgba(244,63,94,0.12), transparent 50%)", filter: "saturate(1.5) brightness(1.2)", animation: "nebulaWarp 60s linear infinite" }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.02) 0deg 5deg, transparent 5deg 10deg)", mixBlendMode: "soft-light", animation: "nebulaSpin 80s linear infinite" }} />
      </>}

      {features.starfield &&
        <div ref={starfieldRef} className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: "translate(var(--mouseX, 0), var(--mouseY, 0))", transformStyle: "preserve-3d" }}>
          {stars.map((s, i) => (
            <span key={i} className="absolute rounded-full bg-slate-300/80 shadow-[0_0_12px_rgba(255,255,255,0.8)]" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: s.o, animation: `twinkle ${s.d}s ease-in-out infinite`, animationDelay: `${(i % 10) * 0.2}s`, transform: `translateZ(${s.parallax * -200}px)` }} />
          ))}
        </div>
      }

      {features.shootingStars &&
        <div className="absolute inset-0 overflow-hidden">
          {shooters.map((s, i) => (
            <span key={s.key} className="absolute h-0.5 w-48 -translate-x-full bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-0" style={{ top: `${s.top}%`, left: "-10%", filter: "drop-shadow(0 0 10px rgba(200,200,255,0.8)) drop-shadow(0 0 24px rgba(168,85,247,0.7))", animation: `shoot ${s.dur}s ease-in ${s.delay + i * 0.8}s infinite` }} />
          ))}
        </div>
      }

      {features.floatingDust &&
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p, i) => (
            <span key={i} className="absolute rounded-full opacity-40 blur-lg mix-blend-screen" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: `hsl(${p.hue}deg 100% 70%)`, animation: `floatY ${p.dur}s ease-in-out ${p.delay}s infinite alternate`, filter: "saturate(1.5) brightness(1.1)" }} />
          ))}
        </div>
      }

      {features.supernova && <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />}

      {features.gridFloor &&
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60vh]">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 opacity-80 [transform:perspective(1000px)_rotateX(70deg)_translateY(45%)] [transform-origin:bottom_center]" style={{ backgroundImage: "linear-gradient(rgba(129,140,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px", backgroundPosition: "center center", animation: "gridPan 10s linear infinite", boxShadow: "inset 0 0 80px rgba(59,130,246,0.3), 0 0 100px rgba(59,130,246,0.25)" }} />
          <div className="absolute inset-0 [transform:perspective(1000px)_rotateX(70deg)_translateY(45%)] [transform-origin:bottom_center]" style={{ background: "radial-gradient(60% 80% at 50% 100%, rgba(129,140,248,0.2), transparent 70%)", animation: "pulse 4.5s ease-in-out infinite" }} />
        </div>
      }

      {features.scanlines && <div className="pointer-events-none absolute inset-0 z-20 bg-[url('/scanlines.png')] opacity-20 mix-blend-overlay"></div>}

      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:py-20 md:py-28 z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-950/50 px-3.5 py-1.5 text-xs text-purple-200 ring-1 ring-white/10 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-purple-300" />
          SYSTEM STATUS: CATASTROPHIC SUCCESS
        </div>

        <div className="relative mt-8 grid place-items-center">
          <h1 ref={titleRef} className={features.glitchText ? "glitch-text" : ""} style={{ textShadow: "0 0 24px rgba(167,139,250,0.6), 0 0 48px rgba(236,72,153,0.4), 0 0 1px rgba(255,255,255,0.8)", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))", transformStyle: "preserve-3d", color: "#fff", position: "relative", zIndex: 10, fontSize: "clamp(3.5rem, 10vw, 6rem)", fontWeight: "900", letterSpacing: "-0.05em" }} data-text="404">
            404
          </h1>

          {features.orbitalEmojis &&
            <div className="pointer-events-none absolute inset-0">
              {emojiRing.map((em, i) => (
                <span key={i} className="absolute select-none text-2xl md:text-4xl" style={{ left: "50%", top: "50%", transformOrigin: "0 -160px", transform: `translate(-50%,-50%) rotate(${(360 / emojiRing.length) * i}deg)`, animation: `orbit 12s linear infinite`, animationDelay: `${i * -1.0}s`, filter: "drop-shadow(0 0 8px rgba(255,255,255,0.7)) drop-shadow(0 0 20px rgba(236,72,153,0.6))" }}>
                  <span style={{ display: "inline-block", transform: `rotate(${-((360 / emojiRing.length) * i)}deg) rotate(-90deg)` }}>{em}</span>
                </span>
              ))}
            </div>
          }
        </div>

        <p className="mt-6 max-w-2xl text-lg font-medium text-slate-300 md:text-xl">
          {typed || "\u00A0"}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link ref={btnRef} to="/" onMouseMove={(e) => { onMagnetic(e); onPointerGlow(e); }} onMouseLeave={onMagneticLeave} className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl border border-blue-500/50 bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3 text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(59,130,246,0.8)] transition-transform duration-150 ease-out hover:scale-[1.04] active:scale-[0.97]" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15), 0 10px 40px -10px rgba(59,130,246,0.8)", filter: "drop-shadow(0 0 12px rgba(59,130,246,0.7)) drop-shadow(0 0 30px rgba(59,130,246,0.5))" }}>
            <span ref={glowRef} className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(160px 120px at var(--x,50%) var(--y,50%), rgba(255,255,255,0.35), transparent 70%)" }} />
            <Home className="h-5 w-5" />
            ESCAPE REALITY
            <span aria-hidden="true" className="ml-1.5 inline-flex items-center rounded-md bg-white/25 px-2 py-0.5 text-[11px] font-semibold" title="Press H">H</span>
          </Link>
          
          <button type="button" onClick={() => supernova(undefined, undefined, 3.0)} className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl border border-rose-500/50 bg-gradient-to-br from-rose-500 to-red-600 px-6 py-3 text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(244,63,94,0.8)] transition-transform duration-150 ease-out hover:scale-[1.04] active:scale-[0.97]" style={{ filter: "drop-shadow(0 0 12px rgba(244,63,94,0.7)) drop-shadow(0 0 30px rgba(244,63,94,0.5))" }}>
            <ShieldAlert className="h-5 w-5" />
            GALAXY MODE
            <span aria-hidden="true" className="ml-1.5 inline-flex items-center rounded-md bg-white/25 px-2 py-0.5 text-[11px] font-semibold" title="Press G">G</span>
          </button>
        </div>
        
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="info-chip"><Stars className="h-3.5 w-3.5" /> 3D Starfield</span>
          <span className="info-chip"><Flame className="h-3.5 w-3.5" /> Supernova Engine</span>
          <span className="info-chip"><Rocket className="h-3.5 w-3.5" /> Cosmic Cursor</span>
          <span className="info-chip"><Zap className="h-3.5 w-3.5" /> Energy Grid</span>
          <span className="info-chip"><Atom className="h-3.5 w-3.5" /> Black Hole (B)</span>
        </div>
      </section>

      {/* --- Help Panel for Keyboard Toggles --- */}
      {showHelp &&
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-slate-500/50 bg-slate-800/60 p-4 text-slate-300 shadow-2xl backdrop-blur-lg animate-fadeIn">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-white"><Keyboard className="h-5 w-5"/> FX Controls</h3>
          <ul className="space-y-1.5 text-xs">
            {Object.entries(featureKeyMap).map(([key, name]) => (
                <li key={name} className="flex justify-between items-center gap-4">
                  <span className="capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <kbd className={`rounded px-1.5 py-0.5 text-white ${features[name] ? 'bg-green-600/80' : 'bg-red-600/80'}`}>
                      {key}
                  </kbd>
                </li>
            ))}
          </ul>
          <button onClick={() => setShowHelp(false)} className="mt-4 w-full rounded-md bg-slate-700/80 py-1 text-xs text-slate-200 hover:bg-slate-700">
            Close (or press K)
          </button>
        </div>
      }

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

      <style>{`
        .info-chip { display: inline-flex; align-items: center; gap: 4px; border-radius: 9999px; border: 1px solid rgba(148, 163, 184, 0.3); background-color: rgba(30, 41, 59, 0.5); padding: 4px 10px; color: rgb(160 174 192); backdrop-filter: blur(4px); }
        .glitch-text { color: transparent; -webkit-text-stroke: 1px rgba(255, 255, 255, 0.6); background: linear-gradient(135deg, white 40%, rgba(255,255,255,0.2)); -webkit-background-clip: text; background-clip: text; }
        .glitch-text::before { content: attr(data-text); position: absolute; left: -2px; top: 0; color: transparent; background: linear-gradient(135deg, #f87171, #60a5fa); -webkit-background-clip: text; background-clip: text; -webkit-text-stroke: 1px transparent; mix-blend-mode: screen; animation: glitch 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; }
        @keyframes glitch { 0%, 100% { transform: translate(0, 0); clip-path: inset(45% 0 35% 0); } 25% { clip-path: inset(15% 0 55% 0); } 50% { transform: translate(0.5em, -0.1em); clip-path: inset(65% 0 15% 0); } 75% { clip-path: inset(35% 0 45% 0); } }
        .shake { animation: screenShake 0.5s ease-in-out both; }
        @keyframes screenShake { 0%, 100% { transform: translate(0, 0) rotate(0); } 10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 3px) rotate(-0.5deg); } 20%, 40%, 60%, 80% { transform: translate(2px, -3px) rotate(0.5deg); } }
        .vortex-active { animation: vortexSpin 2s cubic-bezier(0.165, 0.84, 0.44, 1) both; }
        @keyframes vortexSpin { 0% { transform: scale(1) rotate(0deg); filter: blur(0px) saturate(1) contrast(1) hue-rotate(0deg); } 50% { transform: scale(1.1) rotate(15deg); filter: blur(4px) saturate(2.5) contrast(1.5) hue-rotate(90deg); } 90% { transform: scale(0.1) rotate(-180deg); filter: blur(16px) saturate(5) contrast(2) hue-rotate(360deg) invert(1); } 100% { transform: scale(1) rotate(0deg); filter: blur(0px) saturate(1) contrast(1) hue-rotate(0deg); } }
        @keyframes floatY { 0% { transform: translateY(0); } 100% { transform: translateY(-50px); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.3); } }
        @keyframes orbit { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes nebulaWarp { 0% { transform: rotate(0deg) scale(1.2); } 100% { transform: rotate(360deg) scale(1.2); } }
        @keyframes gridPan { from { background-position: 0 0; } to { background-position: -40px -40px; } }
        @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.45; } }
        @keyframes shoot { 0% { transform: translateX(0) translateY(0) rotate(10deg); opacity: 0; } 5% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(140vw) translateY(-25vh) rotate(10deg); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
    </main>
  );
};

export default NotFoundPage;