import React, { useEffect, useRef } from "react";

const STORAGE_KEY = "offline-high-score-v1";

type GameState = "idle" | "running" | "paused" | "over";

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  active: boolean;
}

interface Star {
  x: number;
  y: number;
  size: number;
  vy: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const OfflinePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Runtime flags and refs (mutable, no React re-renders needed)
    let raf = 0;
    let now = performance.now();
    let last = now;
    let acc = 0; // accumulator for fixed timestep
    const fixedDt = 1000 / 60; // ms per frame at 60fps
    const maxFrameStep = 50; // clamp large frame gaps

    // Device pixel ratio scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Preferences
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let isDark = prefersDark.matches;
    const reduceMotion = prefersReducedMotion.matches;

    // Game constants (CSS pixels; scaled by DPR in render)
    const PLAYER_W = 30;
    const PLAYER_H = 30;
    const PLAYER_SPEED = 380; // px/sec
    const PLAYER_ACCEL = 2400; // px/sec^2 for smoothing
    const MAX_BLOCKS = 120;
    const MAX_PARTICLES = reduceMotion ? 60 : 180;
    const MAX_STARS = reduceMotion ? 30 : 90;

    // Game state
    let state: GameState = "idle";
    let score = 0;
    let bestScore = Number(localStorage.getItem(STORAGE_KEY) || "0");

    // Player
    const player = {
      x: 0,
      y: 0,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: 0,
      targetX: 0,
    };

    // Entities
    const blocks: Block[] = [];
    const stars: Star[] = [];
    const particles: Particle[] = [];

    // Timers
    let spawnTimer = 0; // ms
    let spawnInterval = 550; // ms, decreases with difficulty
    let difficultyTimer = 0; // ms
    let pausedByVisibility = false;

    // Input
    let leftHeld = false;
    let rightHeld = false;
    let pointerActive = false;
    let pointerX = 0;

    // Camera shake
    let shakeMag = 0;
    let shakeTime = 0;

    // Colors
    function palette() {
      return isDark
        ? {
            bg1: "#0a0a0a",
            bg2: "#1a1a1a",
            text: "#e6e6e6",
            player: "#60a5fa",
            block: "#ef4444",
            hud: "rgba(0,0,0,0.4)",
            particleA: "#fb7185",
            particleB: "#fbbf24",
            star: "rgba(255,255,255,0.9)",
            outline: "rgba(255,255,255,0.15)",
          }
        : {
            bg1: "#f9fafb",
            bg2: "#e5e7eb",
            text: "#111827",
            player: "#2563eb",
            block: "#dc2626",
            hud: "rgba(255,255,255,0.6)",
            particleA: "#ef4444",
            particleB: "#f59e0b",
            star: "rgba(0,0,0,0.85)",
            outline: "rgba(0,0,0,0.1)",
          };
    }

    // Resize canvas to container with fixed aspect ratio
    function resize() {
      if (!container || !canvas || !ctx) return;
      const rect = container.getBoundingClientRect();
      const maxWidth = Math.min(rect.width, 720);
      const aspect = 3 / 2; // 600 x 400 feel
      const cssW = Math.max(300, Math.floor(maxWidth));
      const cssH = Math.floor(cssW / aspect);

      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Place player near bottom center if not running
      if (state === "idle" || state === "over") {
        player.x = cssW / 2 - player.w / 2;
        player.y = cssH - player.h - 12;
        player.vx = 0;
        player.targetX = player.x;
      } else if (state === "running") {
        // Keep within bounds after resize
        player.x = clamp(player.x, 0, cssW - player.w);
        player.y = clamp(player.y, 0, cssH - player.h);
      }
    }

    function clamp(v: number, a: number, b: number) {
      return Math.max(a, Math.min(b, v));
    }

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Stars
    function initStars() {
      if (!canvas) return;
      stars.length = 0;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      for (let i = 0; i < MAX_STARS; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.5 + 0.5,
          vy: Math.random() * 30 + 20,
          alpha: Math.random() * 0.6 + 0.2,
        });
      }
    }

    // Blocks
    function spawnBlock() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (blocks.length >= MAX_BLOCKS) return;

      const bw = Math.floor(rand(24, 40));
      const bh = Math.floor(rand(24, 38));
      const x = Math.floor(rand(0, w - bw));
      const y = -bh;
      const base = 150;
      const diffBoost = clamp(score / 40, 0, 400);
      const vy = rand(base, base + 80) + diffBoost; // px/sec
      blocks.push({ x, y, w: bw, h: bh, vy, active: true });
    }

    // Particles (explosion)
    function emitExplosion(x: number, y: number) {
      const count = reduceMotion ? 10 : 28;
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) break;
        const ang = rand(0, Math.PI * 2);
        const spd = rand(60, 260);
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0,
          maxLife: rand(400, 900), // ms
          color: Math.random() < 0.5 ? palette().particleA : palette().particleB,
        });
      }
    }

    // HUD live region for accessibility
    function updateLiveRegion() {
      const el = liveRegionRef.current;
      if (!el) return;
      el.textContent = `Score ${Math.floor(score)}. Best ${bestScore}.`;
    }

    // Start/restart
    function startGame() {
      if (!canvas) return;
      state = "running";
      score = 0;
      spawnTimer = 0;
      difficultyTimer = 0;
      shakeMag = 0;
      shakeTime = 0;
      blocks.length = 0;
      particles.length = 0;

      // Position player
      const rect = canvas.getBoundingClientRect();
      player.x = rect.width / 2 - player.w / 2;
      player.y = rect.height - player.h - 12;
      player.vx = 0;
      player.targetX = player.x;

      updateLiveRegion();
    }

    function gameOver() {
      state = "over";
      shakeMag = reduceMotion ? 0 : 8;
      shakeTime = reduceMotion ? 0 : 220; // ms

      emitExplosion(player.x + player.w / 2, player.y + player.h / 2);

      if (score > bestScore) {
        bestScore = Math.floor(score);
        localStorage.setItem(STORAGE_KEY, String(bestScore));
      }
      updateLiveRegion();
    }

    function togglePause() {
      if (state === "running") {
        state = "paused";
      } else if (state === "paused") {
        state = "running";
      }
    }

    // Input handlers
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          leftHeld = true;
          break;
        case "ArrowRight":
        case "KeyD":
          rightHeld = true;
          break;
        case "Space":
        case "Enter":
          if (state === "idle" || state === "over") startGame();
          break;
        case "KeyP":
        case "Escape":
          if (state === "running" || state === "paused") {
            togglePause();
          }
          break;
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          leftHeld = false;
          break;
        case "ArrowRight":
        case "KeyD":
          rightHeld = false;
          break;
      }
    }

    function clientToCanvasX(clientX: number) {
      if (!canvas) return 0;
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * rect.width;
    }

    function onPointerDown(e: PointerEvent) {
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      pointerActive = true;
      pointerX = clientToCanvasX(e.clientX);
      if (state === "idle" || state === "over") {
        startGame();
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!pointerActive) return;
      pointerX = clientToCanvasX(e.clientX);
    }

    function onPointerUp(e: PointerEvent) {
      if (!canvas) return;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Intentionally ignore errors
      }
      pointerActive = false;
    }

    function onVisibilityChange() {
      if (document.hidden && state === "running") {
        pausedByVisibility = true;
        state = "paused";
      } else if (!document.hidden && pausedByVisibility) {
        pausedByVisibility = false;
        state = "running";
        // reset timing to avoid a huge dt
        last = performance.now();
        acc = 0;
      }
    }

    function onThemeChange() {
      isDark = prefersDark.matches;
    }

    // Update (fixed timestep)
    function step(dtMs: number) {
      if (state !== "running" || !canvas) return;

      // Adjust difficulty over time
      difficultyTimer += dtMs;
      const diffLevel = Math.floor(difficultyTimer / 6000); // every 6s
      spawnInterval = clamp(550 - diffLevel * 40, 180, 550);

      // Score by survival time (points per second)
      score += dtMs * 0.08; // ~4.8 points per second
      if ((score | 0) % 10 === 0) updateLiveRegion();

      // Player movement
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      const inputDir = (rightHeld ? 1 : 0) - (leftHeld ? 1 : 0);

      if (pointerActive) {
        player.targetX = clamp(pointerX - player.w / 2, 0, w - player.w);
      } else if (inputDir !== 0) {
        player.targetX = clamp(
          player.x + inputDir * PLAYER_SPEED * (dtMs / 1000),
          0,
          w - player.w
        );
      }

      // Smooth towards targetX
      const dx = player.targetX - player.x;
      const ax = clamp(dx * 12, -PLAYER_ACCEL, PLAYER_ACCEL);
      player.vx += ax * (dtMs / 1000);
      // Clamp velocity
      player.vx = clamp(
        player.vx,
        -PLAYER_SPEED * 1.2,
        PLAYER_SPEED * 1.2
      );
      // Apply friction if close
      if (Math.abs(dx) < 1) player.vx *= 0.6;
      player.x += player.vx * (dtMs / 1000);
      player.x = clamp(player.x, 0, w - player.w);
      player.y = h - player.h - 12;

      // Spawning
      spawnTimer += dtMs;
      while (spawnTimer >= spawnInterval) {
        spawnTimer -= spawnInterval;
        spawnBlock();
      }

      // Move blocks
      for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        if (!b.active) continue;
        b.y += (b.vy * dtMs) / 1000;
        if (b.y > h + b.h) {
          blocks.splice(i, 1);
          continue;
        }
        // Collision AABB
        const hit =
          player.x < b.x + b.w &&
          player.x + player.w > b.x &&
          player.y < b.y + b.h &&
          player.y + player.h > b.y;
        if (hit) {
          gameOver();
          break;
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dtMs;
        p.x += (p.vx * dtMs) / 1000;
        p.y += (p.vy * dtMs) / 1000;
        // Fade and gravity
        p.vy += 400 * (dtMs / 1000);
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // Camera shake decay
      if (shakeTime > 0) {
        shakeTime -= dtMs;
        shakeMag *= 0.9;
        if (shakeTime <= 0) shakeMag = 0;
      }
    }

    // Render
    function render() {
      if (!canvas || !ctx) return;
      const pal = palette();
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, pal.bg1);
      grad.addColorStop(1, pal.bg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Parallax stars
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = pal.star;
      for (const s of stars) {
        s.y += s.vy * (1 / 60); // render-time drift
        if (s.y > h + 2) {
          s.y = -2;
          s.x = Math.random() * w;
        }
        ctx.globalAlpha = s.alpha;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      ctx.restore();

      // Shake transform
      if (shakeMag > 0) {
        const sx = rand(-shakeMag, shakeMag);
        const sy = rand(-shakeMag, shakeMag);
        ctx.save();
        ctx.translate(sx, sy);
      }

      // Blocks
      ctx.save();
      ctx.fillStyle = palette().block;
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1;
      for (const b of blocks) {
        roundRect(ctx, b.x, b.y, b.w, b.h, 6);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // Player
      ctx.save();
      ctx.fillStyle = pal.player;
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1.2;
      roundRect(ctx, player.x, player.y, player.w, player.h, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Particles
      for (const p of particles) {
        const t = p.life / p.maxLife;
        ctx.globalAlpha = clamp(1 - t, 0, 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + 2 * (1 - t), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (shakeMag > 0) {
        ctx.restore(); // end shake
      }

      // HUD
      ctx.save();
      ctx.fillStyle = pal.hud;
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 1;

      // Score pill
      const scoreStr = `Score ${Math.floor(score)}  •  Best ${bestScore}`;
      ctx.font = "bold 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.textBaseline = "top";
      const padX = 10;
      const padY = 6;
      const txtW = ctx.measureText(scoreStr).width;
      const boxW = txtW + padX * 2;
      const boxH = 26;

      roundRect(ctx, 10, 10, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = palette().text;
      ctx.fillText(scoreStr, 10 + padX, 10 + padY);

      // Overlays
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (state === "idle") {
        drawTitle(ctx, w, h, pal);
        drawHelp(ctx, w, h, pal);
      } else if (state === "paused") {
        drawCenterText(ctx, w, h, pal, "Paused", 28, -8);
        drawCenterText(
          ctx,
          w,
          h,
          pal,
          "Press P or Esc to resume",
          16,
          20
        );
      } else if (state === "over") {
        drawCenterText(ctx, w, h, pal, "Game Over", 30, -16);
        drawCenterText(
          ctx,
          w,
          h,
          pal,
          "Press Space/Enter or Tap to Restart",
          16,
          16
        );
      }

      ctx.restore();
    }

    function drawTitle(
      ctx: CanvasRenderingContext2D,
      w: number,
      _h: number,
      pal: ReturnType<typeof palette>
    ) {
      ctx.fillStyle = pal.text;
      ctx.font = "600 24px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText("Avoid the falling blocks!", w / 2, _h / 2 - 30);
    }

    function drawHelp(
      ctx: CanvasRenderingContext2D,
      w: number,
      _h: number,
      pal: ReturnType<typeof palette>
    ) {
      ctx.fillStyle = pal.text;
      ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText(
        "Left/Right or A/D to move • Space/Enter to start • Tap to play",
        w / 2,
        _h / 2 + 6
      );
      ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText("P or Esc to pause", w / 2, _h / 2 + 26);
    }

    function drawCenterText(
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      pal: ReturnType<typeof palette>,
      text: string,
      size: number,
      yOffset = 0
    ) {
      ctx.fillStyle = pal.text;
      ctx.font = `600 ${size}px system-ui, -apple-system, Segoe UI, Roboto`;
      ctx.fillText(text, w / 2, h / 2 + yOffset);
    }

    function roundRect(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }

    // Main loop
    function loop() {
      now = performance.now();
      let frameTime = now - last;
      if (frameTime > maxFrameStep) frameTime = maxFrameStep; // clamp
      last = now;

      acc += frameTime;
      while (acc >= fixedDt) {
        step(fixedDt);
        acc -= fixedDt;
      }

      // Update star drift even when paused/idle for ambience
      render();
      raf = requestAnimationFrame(loop);
    }

    // Init
    resize();
    initStars();
    updateLiveRegion();

    // Events
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(container);

    prefersDark.addEventListener("change", onThemeChange);
    prefersReducedMotion.addEventListener("change", () => {
      // Not dynamically re-scaling entities for brevity
    });

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Start loop
    raf = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      prefersDark.removeEventListener("change", onThemeChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        textAlign: "center",
        marginTop: 24,
        padding: "0 16px",
      }}
    >
      <h1
        style={{
          margin: "0 0 8px",
          fontSize: 24,
          lineHeight: 1.2,
        }}
      >
        You’re offline
      </h1>
      <p
        style={{
          margin: "0 0 16px",
          color: "#6b7280",
          fontSize: 14,
        }}
      >
        Avoid the falling blocks and survive as long as you can!
      </p>

      {/* Live region for SR users */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clipPath: "inset(50%)",
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          display: "block",
          margin: "0 auto",
          maxWidth: "100%",
          background: "transparent",
          touchAction: "none",
        }}
      />
    </div>
  );
};

export default OfflinePage;
