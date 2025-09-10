import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  memo,
} from "react";
import ReactDOM from "react-dom";
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
  Keyboard,
} from "lucide-react";
import { useSEO } from "../utils/useSEO";
import { useTheme } from "../contexts/ThemeContext";

// Feature toggles used across the page and FX controls
type Features = {
  supernova: boolean;
  cosmicCursor: boolean;
  parallax: boolean;
  starfield: boolean;
  shootingStars: boolean;
  floatingDust: boolean;
  gridFloor: boolean;
  backgroundNebula: boolean;
  scanlines: boolean;
  blackHole: boolean;
  glitchText: boolean;
  orbitalEmojis: boolean;
  magneticButton: boolean;
  typewriter: boolean;
};

function useGPULayer<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  props?: {
    willChange?: string;
    contain?: string;
  }
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.willChange = props?.willChange ?? "transform, opacity";
    el.style.transform = "translateZ(0)";
    el.style.backfaceVisibility = "hidden";
    el.style.contain = props?.contain ?? "layout paint style size";
  }, [ref, props?.willChange, props?.contain]);
}

// Memoized FX Controls rendered via a portal; manages its own open state and 'K' hotkey
const FXControlsHub = memo(function FXControlsHub({
  features,
  setFeatures,
}: {
  features: Features;
  setFeatures: React.Dispatch<React.SetStateAction<Features>>;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = useCallback((key: keyof Features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  }, [setFeatures]);

  if (!open) return null;

  // Local feature hotkey map to display key labels
  const featureKeyMap: Record<string, keyof Features> = {
    '1': 'supernova', '2': 'cosmicCursor', '3': 'parallax',
    '4': 'starfield', '5': 'shootingStars', '6': 'floatingDust',
    '7': 'gridFloor', '8': 'glitchText', '9': 'orbitalEmojis',
    '0': 'magneticButton', '-': 'typewriter', '=': 'backgroundNebula',
  };

  return ReactDOM.createPortal(
    <div className="fixed bottom-4 right-4 z-[1000]">
      <div className="rounded-xl border border-slate-300/80 bg-white/60 p-4 text-slate-700 shadow-2xl backdrop-blur-lg animate-fadeIn dark:border-slate-500/50 dark:bg-slate-800/60 dark:text-slate-300">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Keyboard className="h-5 w-5"/> FX Controls
        </h3>
        <ul className="space-y-1.5 text-xs">
          {Object.entries(featureKeyMap).map(([key, name]) => (
            <li key={name} className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => toggle(name)}
                className="flex-1 text-left capitalize hover:underline"
              >
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </button>
              <kbd
                className={`rounded px-1.5 py-0.5 text-white ${features[name] ? 'bg-green-600/80' : 'bg-red-600/80'}`}
                title={`Toggle ${name}`}
              >
                {key}
              </kbd>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setOpen(false)}
          className="mt-4 w-full rounded-md bg-slate-200/80 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-700/80 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Close (or press K)
        </button>
      </div>
    </div>,
    document.body
  );
});




// Performance controller: tracks visibility and approximated FPS to scale/disable animations
function usePerformanceController() {
  // We avoid re-rendering every second: update only when buckets change.
  const fpsRef = useRef(60);
  const [visible, setVisible] = useState(() => typeof document === 'undefined' ? true : !document.hidden);
  const [lowPerf, setLowPerf] = useState(false); // bucket: true if low perf
  const [shouldAnimate, setShouldAnimate] = useState(true); // paused state with hysteresis

  useEffect(() => {
    let frames = 0;
    let rafId: number | null = null;
    let lastTime = performance.now();

    const loop = (t: number) => {
      frames++;
      if (t - lastTime >= 1000) {
        fpsRef.current = frames;
        // Bucketize and only update state if bucket boundaries crossed
        // Low perf if < 50 FPS
        const nowLow = frames < 50;
        if (nowLow !== lowPerf) setLowPerf(nowLow);
        // Hysteresis for pausing: pause below 28, resume above 35
        if (visible) {
          if (frames < 28 && shouldAnimate) setShouldAnimate(false);
          else if (frames > 35 && !shouldAnimate) setShouldAnimate(true);
        }
        frames = 0;
        lastTime = t;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const onVis = () => {
      const v = !document.hidden;
      setVisible(v);
      // Pause immediately when hidden, resume when visible (keeps hysteresis for FPS only)
      setShouldAnimate(v);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [lowPerf, shouldAnimate, visible]);

  const deviceScale = lowPerf ? 0.6 : 1.0;
  return { fps: fpsRef.current, lowPerf, deviceScale, shouldAnimate };
}


/**
 * Supernova Explosion Engine v2.4 (Type-Safe)
 * Now accepts a `theme` prop to adjust colors for light/dark mode.
 */
function useSupernovaExplosion({ enabled = true, theme = 'dark', perfScale = 1 }: { enabled?: boolean; theme?: "light" | "dark"; perfScale?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isShaking, setShaking] = useState(false);
  // FIX: Initialize useRef with null to provide an initial value and use a union type to allow for null.
  const animationFrameId = useRef<number | null>(null);

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
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // Ensure the canvas is fully reset before starting a new explosion
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      animationFrameId.current = null;

      triggerScreenShake();

      const rect = canvas.getBoundingClientRect();
      const cx = x ?? rect.width / 2;
      const cy = y ?? rect.height / 2;

      const N = Math.max(80, Math.floor(400 * power * perfScale));
      let activeParticles = N;

      const particles = Array.from({ length: N }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() ** 2 * 12 + 8) * power;
        const life = Math.random() * 80 + 80;
        const shapeType = Math.random();
        
        const colorLightness = theme === 'dark' ? 75 : 55;
        const colorSaturation = theme === 'dark' ? 100 : 95;

        const hue = Math.floor(Math.random() * 360);
        const color = `hsl(${hue}, ${colorSaturation}%, ${colorLightness}%)`;
        const trailColor = `hsla(${hue}, ${colorSaturation}%, ${colorLightness}%, `;

        return {
          x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          r: Math.random() * 3 + 2, angle: Math.random() * Math.PI * 2,
          speed: speed, life: life, ttl: life,
          color, trailColor,
          spin: (Math.random() - 0.5) * 0.45, drag: 0.96 - Math.random() * 0.02,
          shape: shapeType > 0.9 ? "star" : shapeType > 0.6 ? "line" : shapeType > 0.3 ? "rect" : "circle",
          trail: [] as { x: number; y: number }[],
        };
      });

      const ringColorLightness = theme === 'dark' ? 70 : 60;
      const ring = { r: 0, o: 0.8, alive: true, color: `hsl(${Math.random() * 360}, 100%, ${ringColorLightness}%)` };

      let frame = 0;
      const animate = () => {
        if (!ctx || !canvas) return;
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
          p.life--;
          if (p.life <= 0) {
            activeParticles--;
            return;
          }

          p.vy += 0.098;
          p.speed *= p.drag;
          p.vx = Math.cos(p.angle) * p.speed;
          p.vy += frame * 0.002 * power;
          p.angle += p.spin;
          p.x += p.vx;
          p.y += p.vy;

          if (i % 2 === 0) {
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 7) p.trail.shift();
          }

          const fade = p.life / p.ttl;
          ctx.globalAlpha = fade;

          if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let j = 1; j < p.trail.length; j++) {
              const t = j / p.trail.length;
              ctx.strokeStyle = `${p.trailColor}${0.1 * (t + 0.1) * fade})`;
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
        if (activeParticles > 0 || ring.alive) {
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // FIX: Assign null, which matches the ref's type `number | null`.
          animationFrameId.current = null;
        }
      };

      animate();
    },
    [triggerScreenShake, enabled, theme, perfScale]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Avoid compounded scaling by resetting transform each resize
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Cleanup when disabled or on unmount to prevent lingering RAF and artifacts
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") || null;
    if (!enabled && canvas && ctx) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    return () => {
      const c = canvasRef.current;
      const cctx = c?.getContext("2d") || null;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (c && cctx) {
        cctx.setTransform(1, 0, 0, 1, 0, 0);
        cctx.clearRect(0, 0, c.width, c.height);
        cctx.globalAlpha = 1;
        cctx.globalCompositeOperation = "source-over";
      }
    };
  }, [enabled]);

  return { canvasRef, supernova, isShaking };
}


/**
 * Cosmic Cursor v1.9 (Type-Safe)
 * Now accepts a `theme` prop to adjust colors for light/dark mode.
 */
function useCosmicCursor({ enabled = true, theme = 'dark', perfScale = 1, active = true }: { enabled?: boolean; theme?: "light" | "dark"; perfScale?: number; active?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // FIX: Initialize useRef with null to provide an initial value and use a union type to allow for null.
  const animationFrameRef = useRef<number | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled || !active) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const POOL_SIZE = Math.max(10, Math.floor(30 * perfScale));
    const pool: HTMLDivElement[] = [];
    let poolIndex = 0;

    for (let i = 0; i < POOL_SIZE; i++) {
        const dot = document.createElement("div");
        dot.className = "pointer-events-none absolute rounded-full will-change-transform";
        dot.style.opacity = "0";
        dot.style.position = 'absolute';
        container.appendChild(dot);
        pool.push(dot);
    }
    
    const onMove = (e: MouseEvent) => {
      lastPosition.current = { x: e.clientX, y: e.clientY };
      
      if (animationFrameRef.current) return;

      animationFrameRef.current = requestAnimationFrame(() => {
        const { x, y } = lastPosition.current;

        const dot = pool[poolIndex];
        poolIndex = (poolIndex + 1) % POOL_SIZE;

        const size = Math.random() * 5 + 3;
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;

        const color = theme === 'dark'
          ? `hsl(${200 + Math.random() * 40}, 100%, 80%)`
          : `hsl(${200 + Math.random() * 40}, 90%, 60%)`;
        const filter = theme === 'dark'
          ? "blur(2px) brightness(1.5)"
          : "blur(1px) brightness(0.95)";
        
        dot.style.transition = 'none';
        dot.style.transform = 'translate(-50%, -50%)';
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${x + offsetX}px`;
        dot.style.top = `${y + offsetY}px`;
        dot.style.background = `radial-gradient(circle, ${color} 0%, transparent 80%)`;
        dot.style.filter = filter;
        dot.style.opacity = "1";

        setTimeout(() => {
            const transitionTime = 800 + Math.random() * 400;
            dot.style.transition = `transform ${700 + Math.random() * 300}ms ease-out, opacity ${transitionTime}ms ease-out`;

            const finalX = (Math.random() - 0.5) * 40;
            const finalY = (Math.random() - 0.5) * 40 - 32;
            dot.style.transform = `translate(${finalX}px, ${finalY}px) scale(0)`;
            dot.style.opacity = "0";
        }, 20);
        // FIX: Assign null, which matches the ref's type `number | null`.
        animationFrameRef.current = null;
      });
    };

    window.addEventListener("mousemove", onMove);
    
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      pool.forEach(dot => dot.remove());
    };
  }, [enabled, theme, perfScale, active]);

  return { containerRef };
}


const NotFoundPage = () => {
  useSEO("404: Cosmic Singularity | DevServe", [{ name: "robots", content: "noindex" }]);
  const { theme } = useTheme();
  const { deviceScale, shouldAnimate } = usePerformanceController();
  const navigate = useNavigate();
  
  const [features, setFeatures] = useState({
    supernova: true, cosmicCursor: true, parallax: true, starfield: true,
    shootingStars: true, floatingDust: true, gridFloor: true, glitchText: true,
    orbitalEmojis: true, magneticButton: true, typewriter: true,
    backgroundNebula: true, scanlines: true, blackHole: true,
  });

  const { canvasRef, supernova, isShaking } = useSupernovaExplosion({ enabled: features.supernova && shouldAnimate, theme, perfScale: deviceScale });
  const handleGalaxyMode = useCallback(() => {
    // Ensure feature is enabled and trigger a fresh explosion
    if (!features.supernova) {
      setFeatures((f) => ({ ...f, supernova: true }));
    }
    supernova(undefined, undefined, 3.0);
  }, [features.supernova, supernova]);
  const { containerRef: cosmicCursorRef } = useCosmicCursor({ enabled: features.cosmicCursor, theme, perfScale: deviceScale, active: shouldAnimate });

  // GPU layer helpers
  const stageRef = useRef<HTMLDivElement | null>(null);
  useGPULayer(stageRef, { contain: "paint" });

  // Also promote the cosmic cursor container to a GPU layer
  useGPULayer<HTMLDivElement>(cosmicCursorRef as any, {
    willChange: "transform, opacity",
    contain: "layout paint style",
  });

  // Promote canvas to its own GPU layer once mounted
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.style.willChange = "transform, opacity";
    c.style.transform = "translateZ(0)";
    c.style.backfaceVisibility = "hidden";
    c.style.contain = "paint style size";
  }, [canvasRef]);

  const stars = useMemo(() => Array.from({ length: Math.max(80, Math.floor(200 * deviceScale)) }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: Math.random() * 1.8 + 0.2,
    d: Math.random() * 6 + 4,
    o: Math.random() * 0.6 + 0.2,
    parallax: Math.random() * 0.4 + 0.1,
  })), [deviceScale]);

  const particles = useMemo(() => Array.from({ length: Math.max(12, Math.floor(40 * deviceScale)) }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 22 + 8,
    dur: Math.random() * 15 + 15,
    delay: Math.random() * 8,
    hue: Math.floor(Math.random() * 360),
  })), [deviceScale]);

  const shooters = useMemo(() =>
    Array.from({ length: Math.max(3, Math.floor(8 * deviceScale)) }, () => ({
      key: Math.random().toString(36).slice(2),
      delay: Math.random() * 8,
      top: Math.random() * 60 + 5,
      dur: Math.random() * 2 + 2.5,
    }))
  , [deviceScale]);

  // Lucide icon ring (replaces emoji ring)
  const iconRing = [Rocket, Stars, Atom, Zap, Flame, Sparkles, ShieldAlert, PartyPopper];

  

  

  const particleNodes = useMemo(() => (
    particles.map((p, i) => (
      <span key={i} className="gpu absolute rounded-full opacity-40 blur-lg mix-blend-multiply dark:mix-blend-screen" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: `hsl(${p.hue}deg 100% ${theme === 'dark' ? '70%' : '60%'})`, animation: `floatY ${p.dur}s ease-in-out ${p.delay}s infinite alternate`, filter: "saturate(1.5) brightness(1.1)", animationPlayState: shouldAnimate ? 'running' : 'paused' }} />
    ))
  ), [particles, shouldAnimate, theme]);

  const message = useMemo(() => "This page hasn't just been lost; it has achieved glorious, explosive transcendence.", []);  
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !features.typewriter) {
      setTyped(message);
      return;
    }
    
    let timerId: number;
    const typeCharacter = () => {
      setTyped(message.slice(0, i) + (Math.random() > 0.95 ? "█" : ""));
      i++;
      if (i > message.length) {
        setTyped(message);
      } else {
        timerId = window.setTimeout(typeCharacter, 40);
      }
    };
    typeCharacter();
    
    return () => clearTimeout(timerId);
  }, [message, features.typewriter]);

  // Global hotkey for Galaxy Mode: 'G'
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleGalaxyMode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleGalaxyMode]);

  // Centralized Mouse Move Handler
  useEffect(() => {
    const stage = stageRef.current;
    // FIX: Check if stage is possibly null before trying to access its properties.
    // This logic ensures we only set styles if the stage element exists.
    if (!features.parallax || !shouldAnimate) {
        if (stage) {
            stage.style.setProperty("--camX", `0deg`);
            stage.style.setProperty("--camY", `0deg`);
            stage.style.setProperty("--titleX", `0px`);
            stage.style.setProperty("--titleY", `0px`);
            stage.style.setProperty("--titleRotX", `0deg`);
            stage.style.setProperty("--titleRotY", `0deg`);
            stage.style.setProperty("--mouseX", `0px`);
            stage.style.setProperty("--mouseY", `0px`);
        }
        return;
    }

    if (!stage) return; // Guard clause for the rest of the effect

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    
    let animationFrameId: number;
    
    const onMove = (e: MouseEvent) => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
            const rect = stage.getBoundingClientRect();
            const mx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
            const my = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
            
            stage.style.setProperty("--camX", `${mx * 2.5}deg`);
            stage.style.setProperty("--camY", `${my * -2.5}deg`);
            stage.style.setProperty("--titleX", `${mx * 16}px`);
            stage.style.setProperty("--titleY", `${my * 16}px`);
            stage.style.setProperty("--titleRotX", `${my * -6}deg`);
            stage.style.setProperty("--titleRotY", `${mx * 10}deg`);
            stage.style.setProperty("--mouseX", `${-mx * 100}px`);
            stage.style.setProperty("--mouseY", `${-my * 100}px`);
        });
    };
    
    const onLeave = () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        stage.style.setProperty("--camX", "0deg");
        stage.style.setProperty("--camY", "0deg");
        stage.style.setProperty("--titleX", "0px");
        stage.style.setProperty("--titleY", "0px");
        stage.style.setProperty("--titleRotX", "0deg");
        stage.style.setProperty("--titleRotY", "0deg");
        stage.style.setProperty("--mouseX", "0px");
        stage.style.setProperty("--mouseY", "0px");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [features.parallax, shouldAnimate]);

  
  // --- Keyboard Control Center ---
  const [vortex, setVortex] = useState(false);

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
      className={`relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 antialiased dark:from-slate-950 dark:via-slate-950 dark:to-black dark:text-slate-100 ${isShaking ? 'shake' : ''} ${vortex ? 'vortex-active' : ''}`}
      style={{
        perspective: '1200px',
        transform: 'translateZ(0) rotateX(var(--camY, 0deg)) rotateY(var(--camX, 0deg))',
        transformStyle: 'preserve-3d',
      }}
    >
      {features.floatingDust && <div className="absolute inset-0 overflow-hidden">{particleNodes}</div>}
      {features.backgroundNebula && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.45,
            filter: 'blur(40px) saturate(1.2)',
            mixBlendMode: theme === 'dark' ? 'screen' as const : 'multiply' as const,
            backgroundImage:
              theme === 'dark'
                ? 'radial-gradient(60% 50% at 20% 20%, rgba(168,85,247,0.25), transparent 60%), radial-gradient(50% 40% at 80% 30%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(40% 50% at 50% 80%, rgba(236,72,153,0.25), transparent 60%)'
                : 'radial-gradient(60% 50% at 20% 20%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(50% 40% at 80% 30%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(40% 50% at 50% 80%, rgba(236,72,153,0.18), transparent 60%)',
            animation: 'nebulaWarp 60s linear infinite',
          }}
        />
      )}
      {features.backgroundNebula && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.45,
            filter: 'blur(40px) saturate(1.2)',
            mixBlendMode: theme === 'dark' ? 'screen' as const : 'multiply' as const,
            backgroundImage:
              theme === 'dark'
                ? 'radial-gradient(60% 50% at 20% 20%, rgba(168,85,247,0.25), transparent 60%), radial-gradient(50% 40% at 80% 30%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(40% 50% at 50% 80%, rgba(236,72,153,0.25), transparent 60%)'
                : 'radial-gradient(60% 50% at 20% 20%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(50% 40% at 80% 30%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(40% 50% at 50% 80%, rgba(236,72,153,0.18), transparent 60%)',
            animation: 'nebulaWarp 60s linear infinite',
          }}
        />
      )}
      {features.supernova && <canvas ref={canvasRef} className="gpu pointer-events-none absolute inset-0 h-full w-full" />}
      {features.gridFloor && <div className="gpu pointer-events-none absolute inset-x-0 bottom-0 h-[60vh]"><div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-slate-950 dark:via-slate-950/50" /><div className="absolute inset-0 opacity-80 [transform:perspective(1000px)_rotateX(70deg)_translateY(45%)] [transform-origin:bottom_center]" style={{ backgroundImage: theme === 'dark' ? "linear-gradient(rgba(129,140,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.3) 1px, transparent 1px)" : "linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px", backgroundPosition: "center center", animation: "gridPan 10s linear infinite", boxShadow: theme === 'dark' ? "inset 0 0 80px rgba(59,130,246,0.3), 0 0 100px rgba(59,130,246,0.25)" : "inset 0 0 80px rgba(148,163,184,0.2), 0 0 100px rgba(148,163,184,0.15)"}} /><div className="absolute inset-0 [transform:perspective(1000px)_rotateX(70deg)_translateY(45%)] [transform-origin:bottom_center]" style={{ background: theme === 'dark' ? "radial-gradient(60% 80% at 50% 100%, rgba(129,140,248,0.2), transparent 70%)" : "radial-gradient(60% 80% at 50% 100%, rgba(100,116,139,0.15), transparent 70%)", animation: "pulse 4.5s ease-in-out infinite" }} /></div>}
      {features.scanlines && <div className="gpu pointer-events-none absolute inset-0 z-20 bg-[url('/scanlines.png')] opacity-[0.07] mix-blend-multiply dark:opacity-20 dark:mix-blend-overlay"></div>}

      {/* FX Controls hub; memoized and isolated from parent; toggled with 'K' */}
      <FXControlsHub features={features} setFeatures={setFeatures} />
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:py-20 md:py-28 z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-100/70 px-3.5 py-1.5 text-xs font-semibold text-purple-700 ring-1 ring-black/5 backdrop-blur-sm dark:border-purple-400/40 dark:bg-purple-950/50 dark:text-purple-200 dark:ring-white/10">
          <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-300" />
          SYSTEM STATUS: CATASTROPHIC SUCCESS
        </div>

        <h1 
            className={features.glitchText ? "glitch-text" : ""} 
            style={{ 
                textShadow: "var(--h1-shadow)", 
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15)) dark:drop-shadow(0 10px 20px rgba(0,0,0,0.5))", 
                transformStyle: "preserve-3d", 
                position: "relative", zIndex: 30, 
                fontSize: "clamp(3.5rem, 10vw, 6rem)", 
                fontWeight: "900", 
                letterSpacing: "-0.05em",
                willChange: 'transform',
                transform: 'translate3d(var(--titleX, 0px), var(--titleY, 0px), 0) rotateX(var(--titleRotX, 0deg)) rotateY(var(--titleRotY, 0deg))'
            }} 
            data-text="404"
        >
            404
        </h1>

          {features.orbitalEmojis && (
            <div className="pointer-events-none absolute inset-0 z-0">
              {Array.from({ length: 24 }).map((_, i) => {
                const Icon = iconRing[i % iconRing.length];
                const radius = 140 + ((i * 37) % 60); // 140-200px pseudo-random
                const dur = 11 + ((i * 3) % 8); // 11-19s
                const hue = (250 + i * 12) % 360; // smooth spectrum
                const sizeBase = 7 + (i % 3); // 7/8/9
                const direction = i % 2 === 0 ? 'normal' : 'reverse';
                return (
                  <span
                    key={i}
                    className="absolute select-none"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: `0 -${radius}px`,
                      transform: `translate(-50%,-50%) rotate(${(360 / 24) * i}deg)`,
                      animation: `orbit ${dur}s linear infinite`,
                      animationDelay: `${i * -0.7}s`,
                      animationDirection: direction as any,
                      filter:
                        theme === 'dark'
                          ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5)) drop-shadow(0 0 24px rgba(236,72,153,0.6))'
                          : 'drop-shadow(0 0 6px rgba(0,0,0,0.2))',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        transform: `rotate(${-((360 / 24) * i)}deg) rotate(-90deg)`,
                        color: `hsl(${hue}deg 90% ${theme === 'dark' ? '75%' : '45%'})`,
                        animation: `swim ${3 + (i % 5)}s ease-in-out ${i * 0.15}s infinite alternate`,
                      }}
                    >
                      <Icon style={{ width: `${sizeBase * 4}px`, height: `${sizeBase * 4}px` }} />
                    </span>
                  </span>
                );
              })}
            </div>
          )}

        <p className="relative z-30 mt-6 max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-300 md:text-xl">
          {typed || "\u00A0"}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            onMouseMove={onPointerGlow} 
            onMouseLeave={e => {
                const g = glowRef.current;
                if(g) g.style.opacity = '0';
            }}
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl border border-slate-300 bg-gradient-to-br from-slate-50 to-slate-200 px-6 py-3 text-base font-bold text-slate-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] transition-transform duration-150 ease-out hover:scale-[1.04] active:scale-[0.97] dark:border-blue-500/50 dark:from-blue-600 dark:to-indigo-600 dark:text-white dark:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.8)]"
            style={{ 
              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.1)) dark:drop-shadow(0 0 12px rgba(59,130,246,0.7)) dark:drop-shadow(0 0 30px rgba(59,130,246,0.5))",
            }}
          >
            {/* subtle sheen */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="absolute left-[-30%] top-0 h-full w-[30%] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/20 skew-x-12 animate-sheen" />
            </span>
            <span ref={glowRef} className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: theme === 'dark' ? "radial-gradient(160px 120px at var(--x,50%) var(--y,50%), rgba(255,255,255,0.35), transparent 70%)" : "radial-gradient(160px 120px at var(--x,50%) var(--y,50%), rgba(0,0,0,0.08), transparent 70%)" }} />
            <Home className="h-5 w-5" />
            ESCAPE REALITY
            <span aria-hidden="true" className="ml-1.5 inline-flex items-center rounded-md bg-black/10 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/25 dark:text-white" title="Press H">H</span>
          </Link>
          
          <button onClick={handleGalaxyMode} className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl border border-rose-400/80 bg-gradient-to-br from-rose-400 to-red-500 px-6 py-3 text-base font-bold text-white shadow-[0_10px_30px_-10px_rgba(244,63,94,0.4)] transition-transform duration-150 ease-out hover:scale-[1.04] active:scale-[0.97] dark:border-rose-500/50 dark:from-rose-500 dark:to-red-600 dark:shadow-[0_10px_40px_-10px_rgba(244,63,94,0.8)]" style={{ filter: "drop-shadow(0 0 10px rgba(244,63,94,0.5)) dark:drop-shadow(0 0 12px rgba(244,63,94,0.7)) dark:drop-shadow(0 0 30px rgba(244,63,94,0.5))" }}>
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80" />

      {/* Unchanged CSS in <style> tag */}
      <style>{`
        :root { --h1-shadow: 0 0 12px rgba(0,0,0,0.1); }
        .dark:root { --h1-shadow: 0 0 24px rgba(167,139,250,0.6), 0 0 48px rgba(236,72,153,0.4), 0 0 1px rgba(255,255,255,0.8); }
        .info-chip { display: inline-flex; align-items: center; gap: 6px; border-radius: 9999px; border: 1px solid; padding: 4px 10px; backdrop-filter: blur(4px); }
        .info-chip { @apply border-slate-300 bg-slate-100/50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400; }
        .glitch-text { color: transparent; background-clip: text; -webkit-background-clip: text; }
        .glitch-text { -webkit-text-stroke: 1px rgba(0, 0, 0, 0.4); background-image: linear-gradient(135deg, #475569 40%, rgba(0,0,0,0.1)); }
        .dark .glitch-text { -webkit-text-stroke: 1px rgba(255, 255, 255, 0.6); background-image: linear-gradient(135deg, white 40%, rgba(255,255,255,0.2)); }
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
        @keyframes shoot { 0% { transform: translateX(0) translateY(0) rotate(10deg); opacity: 1; } 50% { opacity: 1; } 100% { transform: translateX(110vw) translateY(-10vw) rotate(0deg); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes sheen { from { transform: translateX(-120%) skewX(12deg); } to { transform: translateX(220%) skewX(12deg); } }
        .animate-sheen { animation: sheen 2.4s ease-in-out infinite; }
        @keyframes swim { 0% { transform: translateY(-4px) scale(0.98) rotate(-90deg); } 50% { transform: translateY(6px) scale(1.02) rotate(-90deg); } 100% { transform: translateY(-4px) scale(0.98) rotate(-90deg); } }
      `}</style>
    </main>
  );
};

export default NotFoundPage;