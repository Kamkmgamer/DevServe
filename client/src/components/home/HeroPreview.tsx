import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useId,
} from 'react';
import { motion } from 'framer-motion';
import { Settings2, X } from 'lucide-react';
import { TOKENS, useReducedMotionPref, useIsTouch } from '../../utils/tokens';
import { cn } from '../../utils/cn';

/**
 * HeroPreview.tsx
 * - Polished 3D preview with gentle spring physics
 * - Smooth mobile gyroscope with iOS permission flow
 * - Touch fallback for devices without orientation support
 * - Small settings overlay: sensitivity, depth, mode
 * - Subtle haptic on big tilt
 * - TypeScript safe refs and clean rAF lifecycle
 *
 * Notes:
 * - Respects user reduced motion preference
 * - No em or en dashes are used
 */

const BLOCK_COUNT = 6;
const STORAGE_KEY = 'hero_preview_settings_v1';

type Settings = {
  sensitivity: number; // global multiplier
  depth: number; // how much translateZ is used
  mode: 'subtle' | 'eye-catching';
  paused: boolean; // allow user to pause all motion
  accent: 'blue' | 'violet' | 'amber'; // premium accent
  gloss: boolean; // specular glare layer
  borderGlow: boolean; // animated gradient border
};

const defaultSettings: Settings = {
  sensitivity: 1,
  depth: 28,
  mode: 'subtle',
  paused: false,
  accent: 'violet',
  gloss: true,
  borderGlow: true,
};

export const HeroPreview: React.FC<{ title?: string }> = ({ title }) => {
  const reduce = useReducedMotionPref();
  const isTouch = useIsTouch();

  // container and nodes
  const containerRef = useRef<HTMLDivElement | null>(null);
  const floatingRefs = useRef<Array<HTMLDivElement | null>>(
    Array(BLOCK_COUNT).fill(null)
  );
  const rippleLayerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const borderGlowRef = useRef<HTMLDivElement | null>(null);

  // physics state in refs to avoid rerenders
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const floatTargetsRef = useRef<number[]>(Array(BLOCK_COUNT).fill(0));
  const floatCurrentsRef = useRef<number[]>(Array(BLOCK_COUNT).fill(0));

  // settings state persisted to localStorage
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // iOS permission flow
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

// ...

  useEffect(() => {
    if (!isTouch) return;
    const anyDO = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof anyDO.requestPermission === 'function') {
      setNeedsPermission(true);
      setPermissionGranted(false);
    } else {
      setNeedsPermission(false);
      setPermissionGranted(true);
    }
  }, [isTouch]);

  const requestMotionPermission = useCallback(async () => {
    try {
      const anyDO = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof anyDO.requestPermission === 'function') {
        const resp = await anyDO.requestPermission();
        setPermissionGranted(resp === 'granted');
      } else {
        setPermissionGranted(true);
      }
    } catch {
      setPermissionGranted(false);
    } finally {
      setNeedsPermission(false);
    }
  }, []);

// small UI for settings
  const [openSettings, setOpenSettings] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);

  // tap ripple
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!rippleLayerRef.current) return;
    const layer = rippleLayerRef.current;
    const t = e.touches[0];
    if (!t) return;

    const size = Math.max(layer.clientWidth, layer.clientHeight) * 0.9;
    const rect = layer.getBoundingClientRect();
    const x = t.clientX - rect.left - size / 2;
    const y = t.clientY - rect.top - size / 2;

    const el = document.createElement('span');
    Object.assign(el.style, {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
      borderRadius: '50%',
      pointerEvents: 'none',
      background: 'rgba(255,255,255,0.18)',
      transform: 'scale(0)',
      opacity: '1',
      transition: 'transform 520ms cubic-bezier(.2,.9,.2,1), opacity 520ms ease-out',
    } as CSSStyleDeclaration);
    layer.appendChild(el);
    // force reflow
    el.offsetHeight;
    el.style.transform = 'scale(2.2)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 600);
  }, []);

// desktop pointer move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current || reduce || isTouch || settings.paused) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      // gentle sensitivity for pointer
      targetRef.current.x = nx * 10 * settings.sensitivity;
      targetRef.current.y = ny * -8 * settings.sensitivity;
    },
    [reduce, isTouch, settings.sensitivity, settings.paused]
  );
  const handlePointerLeave = useCallback(() => {
    targetRef.current.x = 0;
    targetRef.current.y = 0;
  }, []);

  // keyboard support for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (reduce || settings.paused) return;
    const step = 2 * settings.sensitivity;
    if (e.key === 'ArrowLeft') {
      targetRef.current.x -= step;
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      targetRef.current.x += step;
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      targetRef.current.y -= step;
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      targetRef.current.y += step;
      e.preventDefault();
    } else if (e.key === 'Home') {
      targetRef.current.x = 0; targetRef.current.y = 0; e.preventDefault();
    }
  }, [reduce, settings.paused, settings.sensitivity]);

  // mobile: deviceorientation handler with gentle sensitivity
useEffect(() => {
    if (!isTouch || reduce || permissionGranted === false || settings.paused) return;

    let last = 0;
    const hasOrientation = 'DeviceOrientationEvent' in window;
    const useOrientation = hasOrientation && permissionGranted === true;

    const clamp = (v: number, m = 30) => Math.max(Math.min(v, m), -m);

    const onOrientation = (ev: DeviceOrientationEvent) => {
      const now = (ev as unknown as { timeStamp: number }).timeStamp || Date.now();
      if (now === last) return;
      last = now;

      const gamma = ev.gamma ?? 0; // left-right
      const beta = ev.beta ?? 0; // front-back

      // tuned down for nice eye catching motion
      const gx = (gamma / 24) * settings.sensitivity;
      const by = (beta / 28) * settings.sensitivity;

      targetRef.current.x = clamp(gx * (settings.mode === 'eye-catching' ? 14 : 10), 28);
      targetRef.current.y = clamp(by * (settings.mode === 'eye-catching' ? -8 : -6), 28);

      // floating blocks reaction
      for (let i = 0; i < BLOCK_COUNT; i++) {
        const sign = i % 2 === 0 ? -1 : 1;
        const intensity = 0.55 + i * 0.08;
        floatTargetsRef.current[i] = clamp((gx * -3 * sign + by * 1.6) * intensity, 18);
      }
    };

    const onTouchMoveFallback = (ev: TouchEvent) => {
      // fallback when orientation not available or blocked
      if (!containerRef.current) return;
      const t = ev.touches[0];
      if (!t) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (t.clientX - rect.left) / rect.width - 0.5;
      const ny = (t.clientY - rect.top) / rect.height - 0.5;
      targetRef.current.x = nx * 12 * settings.sensitivity;
      targetRef.current.y = ny * -9 * settings.sensitivity;
      for (let i = 0; i < BLOCK_COUNT; i++) {
        floatTargetsRef.current[i] = (nx * -6 * (i % 2 === 0 ? -1 : 1)) * (0.5 + i * 0.08);
      }
    };

    if (useOrientation && typeof window.addEventListener === 'function') {
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
    } else {
      // try touchmove fallback
      window.addEventListener('touchmove', onTouchMoveFallback, { passive: true });
    }

    return () => {
      if (useOrientation && typeof window.removeEventListener === 'function') {
        window.removeEventListener('deviceorientation', onOrientation as EventListener);
      } else {
        window.removeEventListener('touchmove', onTouchMoveFallback as EventListener);
      }
    };
  }, [isTouch, reduce, settings, permissionGranted]);

  // subtle haptic trigger
  const lastHapticRef = useRef(0);
  const tryHaptic = useCallback((magnitude: number) => {
    try {
      const now = Date.now();
      if (navigator.vibrate && magnitude > 12 && now - lastHapticRef.current > 650) {
        navigator.vibrate(10);
        lastHapticRef.current = now;
      }
    } catch {
      // ignore
    }
  }, []);

// main physics loop with visibility/viewport pause
  useEffect(() => {
    const stiffness = settings.mode === 'eye-catching' ? 0.14 : 0.10;
    const damping = settings.mode === 'eye-catching' ? 0.80 : 0.86;

    let inViewport = true;
    let pageVisible = typeof document !== 'undefined' ? document.visibilityState !== 'hidden' : true;

    // Observe viewport visibility
    let observer: IntersectionObserver | null = null;
    if (containerRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        inViewport = entries[0]?.isIntersecting ?? true;
      }, { threshold: 0.05 });
      observer.observe(containerRef.current);
    }

    const handleVisibility = () => {
      pageVisible = typeof document !== 'undefined' ? document.visibilityState !== 'hidden' : true;
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    const loop = () => {
      if (settings.paused || !inViewport || !pageVisible || reduce) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // spring X
      const dx = targetRef.current.x - currentRef.current.x;
      velocityRef.current.x = velocityRef.current.x * damping + dx * stiffness;
      currentRef.current.x += velocityRef.current.x;

      // spring Y
      const dy = targetRef.current.y - currentRef.current.y;
      velocityRef.current.y = velocityRef.current.y * damping + dy * stiffness;
      currentRef.current.y += velocityRef.current.y;

      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      // apply transform
      if (containerRef.current) {
        const scale =
          1 +
          Math.min(Math.abs(cx) / 200, 0.045) +
          Math.min(Math.abs(cy) / 350, 0.012) +
          (settings.mode === 'eye-catching' ? 0.005 : 0);
        containerRef.current.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg) scale(${scale})`;
      }

      // haptic on stronger motion
      tryHaptic(Math.abs(cx) + Math.abs(cy));

      // update dynamic spotlight based on current tilt
      if (spotRef.current) {
        // Map tilt to percentage within container
        const px = 50 + Math.max(Math.min(cx, 20), -20) * 1.5; // ~20deg maps to +/-30%
        const py = 50 - Math.max(Math.min(cy, 20), -20) * 1.5;
        spotRef.current.style.setProperty('--spot-x', `${px}%`);
        spotRef.current.style.setProperty('--spot-y', `${py}%`);
        spotRef.current.style.opacity = settings.paused || reduce ? '0.35' : '1';
      }

      // floating blocks follow slower for nice parallax
      for (let i = 0; i < BLOCK_COUNT; i++) {
        const ft = floatTargetsRef.current[i] ?? 0;
        const fc = floatCurrentsRef.current[i] ?? 0;
        const fdx = ft - fc;
        floatCurrentsRef.current[i] = fc + fdx * 0.065; // slow follow
        const node = floatingRefs.current[i];
        if (node) {
          const depth = settings.depth + i * (settings.depth > 24 ? 3.5 : 2.8);
          const rotateOpp = -floatCurrentsRef.current[i] * 0.038;
          const translateX = floatCurrentsRef.current[i] * 0.11;
          const translateY = Math.sin((performance.now() / 1000) + i) * (0.6 + i * 0.12);
          node.style.transform = `translate3d(${translateX}px, ${translateY}px, ${depth}px) rotate(${rotateOpp}deg)`;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (observer) observer.disconnect();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [settings.mode, settings.depth, settings.paused, reduce, tryHaptic]);

// cleanup ripple on unmount
  useEffect(() => {
    return () => {
      if (rippleLayerRef.current) rippleLayerRef.current.innerHTML = '';
    };
  }, []);

  // close settings on outside click or Esc
  useEffect(() => {
    if (!openSettings) return;
    const onDown = (e: MouseEvent) => {
      const panel = settingsPanelRef.current;
      const btn = settingsBtnRef.current;
      const target = e.target as Node | null;
      if (panel && !panel.contains(target) && btn && !btn.contains(target)) {
        setOpenSettings(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSettings(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openSettings]);

  // small helpers to update settings
  const updateSetting = (patch: Partial<Settings>) =>
    setSettings((s) => ({ ...s, ...patch }));

// accessible label for screen readers
  const srText = 'Live preview surface. Move mouse or tilt device to interact.';
  const resolvedTitle = title || 'Project Preview';
  const settingsPanelId = useId();

  const resetSettings = () => setSettings({ ...defaultSettings });

  // compute accent gradient classes
  const accentGrad = settings.accent === 'amber'
    ? 'from-amber-400/30 via-orange-500/20 to-pink-500/20'
    : settings.accent === 'blue'
      ? 'from-sky-400/30 via-blue-500/20 to-fuchsia-500/20'
      : 'from-violet-400/30 via-fuchsia-500/20 to-cyan-400/20';

  return (
    <div
      className="relative mx-auto mt-10 w-full max-w-xl md:mt-0"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Hero preview"
      role="region"
    >
      <motion.div
        className={cn(
          TOKENS.surfaceGlass,
          TOKENS.radius.xl,
          'p-4',
          TOKENS.shadow,
          'relative overflow-hidden'
        )}
        style={{ perspective: 950 }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
      {/* ambient glow */}
        <div className={cn('absolute inset-0 bg-gradient-to-br pointer-events-none', accentGrad)} />
        {/* soft noise texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 10%, rgba(0,0,0,0.8) 0.5px, transparent 0.6px), radial-gradient(circle at 50% 30%, rgba(0,0,0,0.8) 0.5px, transparent 0.6px), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.8) 0.5px, transparent 0.6px)',
            backgroundSize: '3px 3px, 4px 4px, 5px 5px',
          }}
        />

        {/* animated border glow */}
        {settings.borderGlow && (
          <div
            ref={(el) => { borderGlowRef.current = el; }}
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[1px] rounded-[inherit]"
            style={{
              background: 'conic-gradient(from 90deg at 50% 50%, rgba(255,255,255,0.2), rgba(0,0,0,0) 35%, rgba(255,255,255,0.2) 70%, rgba(0,0,0,0))',
              filter: 'blur(6px) saturate(120%)',
              opacity: reduce || settings.paused ? 0.25 : 0.55,
              transition: 'opacity 200ms ease',
              maskImage: 'linear-gradient(#000, #000)',
              WebkitMaskImage: 'linear-gradient(#000, #000)',
              mixBlendMode: 'screen',
              animation: reduce || settings.paused ? 'none' : 'spin 12s linear infinite',
            }}
          />
        )}

        {/* keyframes for spin */}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* iOS permission UI */}
        {needsPermission && permissionGranted === false && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
            <div className="bg-white/94 dark:bg-slate-900/94 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-4 text-center shadow-lg max-w-xs">
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-3">
                Enable motion. Tap to allow device motion so the preview reacts to tilt.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={requestMotionPermission}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-slate-800 text-white text-sm"
                >
                  Allow Motion
                </button>
                <button
                  type="button"
                  onClick={() => { setNeedsPermission(false); setPermissionGranted(false); }}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-transparent text-sm border border-slate-200"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* settings toggle */}
<div className="absolute top-3 right-3 z-40">
          <button
            aria-label="Open preview settings"
            aria-haspopup="dialog"
            aria-expanded={openSettings}
            aria-controls={settingsPanelId}
            onClick={() => setOpenSettings((v) => !v)}
            ref={(el) => { settingsBtnRef.current = el; }}
            className="inline-flex items-center justify-center rounded-full p-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
            type="button"
          >
            {openSettings ? <X className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
          </button>
        </div>

        {/* settings panel */}
{openSettings && (
          <div className="absolute top-12 right-3 z-40">
            <div
              id={settingsPanelId}
              ref={(el) => { settingsPanelRef.current = el; }}
              role="dialog"
              aria-label="Preview settings"
              className="w-72 bg-white/96 dark:bg-slate-900/96 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-3 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm">Preview settings</strong>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetSettings}
                    className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
                  >
                    Reset
                  </button>
                  <span className="text-xs text-slate-500">saved</span>
                </div>
              </div>

              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-2">
                Sensitivity
                <input
                  aria-label="Sensitivity"
                  type="range"
                  min={0.4}
                  max={2}
                  step={0.05}
                  value={settings.sensitivity}
                  onChange={(e) => updateSetting({ sensitivity: Number(e.target.value) })}
                  className="w-full mt-1"
                />
              </label>

              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-2">
                Depth
                <input
                  aria-label="Depth"
                  type="range"
                  min={14}
                  max={44}
                  step={1}
                  value={settings.depth}
                  onChange={(e) => updateSetting({ depth: Number(e.target.value) })}
                  className="w-full mt-1"
                />
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                Mode
                <select
                  aria-label="Mode"
                  value={settings.mode}
                  onChange={(e) => updateSetting({ mode: e.target.value as Settings['mode'] })}
                  className="ml-auto text-sm bg-transparent"
                >
                  <option value="subtle">Subtle</option>
                  <option value="eye-catching">Eye catching</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                Accent
                <select
                  aria-label="Accent"
                  value={settings.accent}
                  onChange={(e) => updateSetting({ accent: e.target.value as Settings['accent'] })}
                  className="ml-auto text-sm bg-transparent"
                >
                  <option value="violet">Violet</option>
                  <option value="blue">Blue</option>
                  <option value="amber">Amber</option>
                </select>
              </label>

              <label className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
                Gloss glare
                <input
                  aria-label="Gloss glare"
                  type="checkbox"
                  checked={settings.gloss}
                  onChange={(e) => updateSetting({ gloss: e.target.checked })}
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
                Border glow
                <input
                  aria-label="Border glow"
                  type="checkbox"
                  checked={settings.borderGlow}
                  onChange={(e) => updateSetting({ borderGlow: e.target.checked })}
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
                Pause motion
                <input
                  aria-label="Pause motion"
                  type="checkbox"
                  checked={settings.paused || reduce}
                  onChange={(e) => updateSetting({ paused: e.target.checked })}
                  disabled={reduce}
                />
              </label>
            </div>
          </div>
        )}

        {/* rotating container */}
<div
          ref={(el) => { containerRef.current = el; }}
          className={cn(
            TOKENS.radius.lg,
            'overflow-hidden border border-slate-200/70 dark:border-slate-800/70 relative bg-white/60 dark:bg-slate-900/40 backdrop-blur'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transition: reduce ? 'none' : 'transform 150ms linear',
            willChange: 'transform',
          }}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-live="polite"
          aria-describedby={openSettings ? settingsPanelId : undefined}
        >
          {/* ripple layer */}
          <div
            ref={(el) => { rippleLayerRef.current = el; }}
            className="absolute inset-0 overflow-hidden z-20 pointer-events-none"
            aria-hidden="true"
          />

          {/* main panel: acts as the floating window surface */}
          <div
            className="aspect-[16/10] relative bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900"
            style={{ transform: `translateZ(${settings.depth}px)` }}
          >
            {/* specular glare */}
            {settings.gloss && (
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(120px 80px at 20% 10%, rgba(255,255,255,0.6), rgba(255,255,255,0) 60%), linear-gradient(120deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 30%)',
                  mixBlendMode: 'screen',
                  transform: 'translateZ(1px)'
                }}
              />
            )}
            {/* top shade */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/6 to-transparent pointer-events-none" />
            {/* dynamic spotlight */}
            <div
              ref={(el) => { spotRef.current = el; }}
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(240px 240px at var(--spot-x,50%) var(--spot-y,50%), rgba(255,255,255,0.16), rgba(255,255,255,0) 60%)',
                transition: 'opacity 180ms ease-out',
              }}
            />
            {/* floating window content */}
            <div className="absolute inset-3 md:inset-4 flex flex-col rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur z-10 shadow-sm">
              {/* window chrome */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200/70 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-900/60">
                <span className="inline-flex gap-1.5 mr-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/90" />
                </span>
                <strong className="text-xs text-slate-700 dark:text-slate-200 truncate" title={resolvedTitle}>
                  {resolvedTitle}
                </strong>
                <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">Preview</span>
              </div>
              {/* mini-site content (no scroll) */}
              <div className="flex-1 overflow-hidden">
                {/* header */}
                <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur px-3 py-1.5 border-b border-slate-100/70 dark:border-slate-800/70">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 shadow-sm" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">DevServe</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">by You</div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Overview</span>
                      <span>Projects</span>
                      <span>About</span>
                    </div>
                  </div>
                </div>

                {/* hero section */}
                <section className="px-3 py-3">
                  <h3 className="text-slate-900 dark:text-white text-base md:text-lg font-semibold">Build. Ship. Delight.</h3>
                  <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-prose">
                    I craft fast, accessible web experiences. Here’s a snapshot of recent work with a focus on performance, polish, and UX.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="text-xs px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      View Projects
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded border border-slate-300/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-200">
                      Contact
                    </button>
                  </div>
                </section>

                {/* projects grid */}
                <section className="px-3 pb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="group rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/60 overflow-hidden">
                        <div className="h-20 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900" />
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <strong className="text-[13px] text-slate-800 dark:text-slate-100">Project {i + 1}</strong>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Featured</span>
                          </div>
                          <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-300 line-clamp-2">
                            A concise description highlighting goals, impact, and stack choices.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* about section */}
                <section className="px-3 pb-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">About</h4>
                  <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-300 max-w-prose">
                    I focus on developer experience, performance budgets, and tasteful interfaces. I enjoy
                    building systems that are simple, scalable, and a joy to use.
                  </p>
                </section>

                {/* footer */}
                <footer className="px-3 py-2 border-t border-slate-200/70 dark:border-slate-800/70 text-[11px] text-slate-500 dark:text-slate-400">
                  © {new Date().getFullYear()} DevServe — All rights reserved.
                </footer>
              </div>
              <span className="sr-only">{srText}</span>
            </div>
          </div>

          {/* floating blocks */}
          <div className="grid grid-cols-3 gap-2 p-3" style={{ transform: `translateZ(${Math.max(settings.depth - 16, 8)}px)` }}>
            {Array.from({ length: BLOCK_COUNT }).map((_, i) => (
              <motion.div
                key={i}
                ref={(el) => { floatingRefs.current[i] = el; }}
                className={cn(
                  'group h-14 rounded-lg bg-gradient-to-br shadow-sm transform-gpu relative overflow-hidden',
                  accentGrad
                )}
                whileHover={reduce ? {} : { scale: 1.025 }}
                transition={{ duration: 0.22 }}
                style={{
                  transition: 'transform 220ms linear',
                  transform: `translate3d(0px, ${Math.sin(i) * 1.2}px, ${settings.depth / 2 + i * 3}px)`,
                }}
              >
                {/* inner shimmer */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(120deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 60%)',
                    transform: 'translateX(-100%)',
                    animation: reduce || settings.paused ? 'none' : 'shimmer 2.8s ease-in-out infinite',
                  }}
                />
              </motion.div>
            ))}
          </div>
          <style>{`@keyframes shimmer{0%{transform:translateX(-120%)}50%{transform:translateX(50%)}100%{transform:translateX(120%)}}`}</style>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroPreview;
