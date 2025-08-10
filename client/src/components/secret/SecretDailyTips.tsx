import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/axios";
import { motion, useReducedMotion } from "framer-motion";
import {
  RefreshCw,
  Share2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

/**
 * SecretDailyTips - polished, accessible, and resilient Daily AI Tip card
 *
 * New interactions added:
 * - hover micro animations on card and controls
 * - paragraph level highlight on scroll and keyboard navigation
 * - touch support: swipe left/right to refresh or share, long press to copy
 * - reading mode: auto scroll through paragraphs with play and pause
 * - reading progress bar and paragraph focus indicators
 *
 * Drop this file into src/components/secret/ and import or default export remains the same.
 */

type Props = {
  className?: string;
  refreshInterval?: number | null;
  cacheTTL?: number;
};

const SESSION_KEY = "secret-daily-tip-v2";
const DEFAULT_TIP =
  "AI features coming soon. Configure your AI backend to enable daily tips.";

function formatDateShort(date = new Date()) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function useTipFetcher(cacheTTL = 1000 * 60 * 30) {
  const controllerRef = useRef<AbortController | null>(null);

  const readCache = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { content: string; fetchedAt: number };
      if (Date.now() - parsed.fetchedAt > cacheTTL) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [cacheTTL]);

  const writeCache = useCallback((content: string) => {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ content, fetchedAt: Date.now() })
      );
    } catch {
      // ignore storage errors
    }
  }, []);

  const fetchTip = useCallback(
    async (opts?: { force?: boolean }) => {
      const { force = false } = opts || {};
      if (!force) {
        const cached = readCache();
        if (cached) {
          return { content: String(cached.content), fetchedAt: cached.fetchedAt };
        }
      }

      if (controllerRef.current) {
        try {
          controllerRef.current.abort();
        } catch {
          // noop
        }
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      const signal = controller.signal;

      const attempts = 3;
      let attempt = 0;
      let delay = 450;

      const doRequest = async (): Promise<string> => {
        attempt++;
        try {
          const res = await api.get("/chatbot/daily-tip", {
            signal,
            validateStatus: () => true,
          });

          const content =
            res?.data?.content || res?.data?.tip || (typeof res?.data === "string" ? res.data : undefined);

          if (res.status === 200 && content) return String(content);

          if (signal.aborted) throw new Error("aborted");

          if (attempt < attempts && res.status !== 404) {
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2;
            return doRequest();
          }

          return String(content || DEFAULT_TIP);
        } catch (err: any) {
          if (signal.aborted) throw err;
          if (attempt < attempts) {
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2;
            return doRequest();
          }
          throw err;
        }
      };

      try {
        const content = await doRequest();
        writeCache(content);
        return { content, fetchedAt: Date.now() };
      } finally {
        // no-op
      }
    },
    [readCache, writeCache]
  );

  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  return { fetchTip };
}

export const SecretDailyTips: React.FC<Props> = ({
  className = "",
  refreshInterval = null,
  cacheTTL = 1000 * 60 * 30,
}) => {
  const { fetchTip } = useTipFetcher(cacheTTL);
  const [tip, setTip] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const paraRefs = useRef<Array<HTMLElement | null>>([]);
  const reduced = useReducedMotion();

  // reading mode state
  const [isReading, setIsReading] = useState(false);
  const [currentPara, setCurrentPara] = useState(0);
  const readingTimer = useRef<number | null>(null);

  const lastFetchedLabel = useMemo(() => {
    return lastFetchedAt ? `Fetched ${formatDateShort(new Date(lastFetchedAt))}` : "";
  }, [lastFetchedAt]);

  const load = useCallback(
    async (opts?: { force?: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchTip(opts);
        setTip(res.content);
        setLastFetchedAt(res.fetchedAt);
        setError(null);
        // reset reading state when new tip arrives
        setCurrentPara(0);
        setIsReading(false);
      } catch (err: any) {
        console.warn("SecretDailyTips - fetch failed", err);
        setTip(DEFAULT_TIP);
        setError("Could not fetch tip. Offline or server error.");
      } finally {
        setLoading(false);
      }
    },
    [fetchTip]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!refreshInterval) return;
    const id = window.setInterval(() => load({ force: true }), refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval, load]);

  // paragraph intersection observer to update current paragraph on scroll
  useEffect(() => {
    const el = articleRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // choose the paragraph with largest intersection
        let bestIndex = -1;
        let bestRatio = 0;
        entries.forEach((en) => {
          const idx = Number((en.target as HTMLElement).dataset.idx || -1);
          if (en.intersectionRatio > bestRatio) {
            bestRatio = en.intersectionRatio;
            bestIndex = idx;
          }
        });
        if (bestIndex >= 0) setCurrentPara(bestIndex);
      },
      { root: el, threshold: [0.15, 0.4, 0.7] }
    );

    paraRefs.current.forEach((p) => p && observer.observe(p));
    return () => observer.disconnect();
  }, [tip]);

  // keyboard shortcuts for paragraph navigation and actions
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r") {
        e.preventDefault();
        load({ force: true });
      }
      if (e.key === "c") {
        e.preventDefault();
        copyTip();
      }
      if (e.key === "s") {
        e.preventDefault();
        shareTip();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        goToPara(currentPara + 1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        goToPara(currentPara - 1);
      }
      if (e.key === " ") {
        e.preventDefault();
        toggleReading();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPara, tip]);

  // touch gestures: swipe left to refresh, swipe right to share, long press to copy
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let longPressTimer: number | null = null;

    const onTouchStart = (ev: TouchEvent) => {
      if (!ev.touches || ev.touches.length === 0) return;
      const t = ev.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startTime = Date.now();
      longPressTimer = window.setTimeout(() => {
        // long press: copy tip
        copyTip();
        setToast("Copied via long press");
        setTimeout(() => setToast(null), 1500);
      }, 650) as unknown as number;
    };

    const onTouchMove = (ev: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const onTouchEnd = (ev: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      const touch = ev.changedTouches && ev.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = Date.now() - startTime;
      // horizontal swipe threshold
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) && dt < 600) {
        if (dx < 0) {
          // swipe left: refresh
          load({ force: true });
          setToast("Refreshed");
          setTimeout(() => setToast(null), 1200);
        } else {
          // swipe right: share
          shareTip();
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart as EventListener);
      el.removeEventListener("touchmove", onTouchMove as EventListener);
      el.removeEventListener("touchend", onTouchEnd as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip]);

  // reading mode: auto scroll paragraphs at an interval
  useEffect(() => {
    if (!isReading) {
      if (readingTimer.current) {
        window.clearTimeout(readingTimer.current);
        readingTimer.current = null;
      }
      return;
    }

    const advance = () => {
      const next = Math.min((paraRefs.current.length || 1) - 1, currentPara + 1);
      if (next === currentPara) {
        // reached the end
        setIsReading(false);
        return;
      }
      goToPara(next, { smooth: true });
      readingTimer.current = window.setTimeout(advance, 2200);
    };

    // small initial delay then start
    readingTimer.current = window.setTimeout(advance, 700);

    return () => {
      if (readingTimer.current) {
        window.clearTimeout(readingTimer.current);
        readingTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReading, currentPara, tip]);

  const goToPara = useCallback((index: number, opts?: { smooth?: boolean }) => {
    const clamped = Math.max(0, Math.min((paraRefs.current.length || 1) - 1, index));
    const el = paraRefs.current[clamped];
    if (!el || !articleRef.current) return;
    setCurrentPara(clamped);
    el.scrollIntoView({ behavior: opts?.smooth ? "smooth" : "auto", block: "center" });
  }, []);

  // copy with feedback
  const copyTip = useCallback(async () => {
    try {
      if (!tip) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tip);
      } else {
        const ta = document.createElement("textarea");
        ta.value = tip;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setToast("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
      setTimeout(() => setToast(null), 2100);
    } catch {
      setToast("Could not copy");
      setTimeout(() => setToast(null), 2000);
    }
  }, [tip]);

  const shareTip = useCallback(async () => {
    if (!tip) return;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Daily AI Tip", text: tip });
        setToast("Shared");
        setTimeout(() => setToast(null), 1500);
      } catch {
        // ignore
      }
    } else {
      await copyTip();
    }
  }, [tip, copyTip]);

  const toggleReading = useCallback(() => {
    setIsReading((v) => !v);
  }, []);

  // small helper to build paragraph refs
  const renderParagraphs = useCallback(() => {
    const parts = tip ? tip.split("\n\n") : [DEFAULT_TIP];
    paraRefs.current = new Array(parts.length).fill(null);
    return parts.map((p, i) => (
      <p
        key={i}
        ref={(el) => {
          paraRefs.current[i] = el;
        }}
        data-idx={i}
        className={`mb-4 leading-7 text-slate-800 dark:text-slate-100 transition-colors p-2 rounded-md ${
          i === currentPara ? "bg-indigo-50 dark:bg-indigo-900/30 shadow-inner" : "bg-transparent"
        }`}
        style={{ whiteSpace: "pre-line" }}
      >
        {p}
      </p>
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip, currentPara]);

  // reading progress percent
  const progressPct = useMemo(() => {
    const total = paraRefs.current.length || 1;
    return Math.round(((currentPara + 1) / total) * 100);
  }, [currentPara]);

  return (
    <div ref={containerRef} className={className} aria-live="polite" aria-atomic>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 -top-12 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-300/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 w-64 h-64 rounded-full bg-gradient-to-bl from-cyan-300/10 to-indigo-400/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.45 }}
          className="max-w-3xl mx-auto"
        >
          <header className="text-center mb-6">
            <div className="inline-flex items-center gap-3">
              <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow" aria-hidden />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Daily AI Tip</h2>
              <div className="flex items-center" aria-hidden>
                <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Short, actionable tip powered by your AI backend</p>
          </header>

          <motion.section
            role="region"
            aria-label="Daily AI tip"
            whileHover={reduced ? undefined : { scale: 1.01 }}
            className="relative bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/40 dark:border-slate-700/40 rounded-2xl p-5 sm:p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 11a5 5 0 0110 0c0 4-5 7-5 7s-5-3-5-7z" fill="currentColor" />
                    <path d="M11 7h2v2h-2z" fill="rgba(255,255,255,0.9)" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{loading ? "Fetching tip..." : "Tip"}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{lastFetchedLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => load({ force: true })}
                  title="Refresh tip"
                  aria-label="Refresh tip"
                  whileTap={reduced ? undefined : { scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800/80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </motion.button>

                <motion.button
                  onClick={shareTip}
                  title="Share tip"
                  aria-label="Share tip"
                  whileTap={reduced ? undefined : { scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800/80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>
              </div>
            </div>

            <div className="mt-4 relative">
              {/* reading controls and progress */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPara(currentPara - 1)}
                    aria-label="Previous paragraph"
                    className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleReading}
                    aria-pressed={isReading}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800/80 transition focus:outline-none"
                  >
                    {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isReading ? "Pause" : "Read"}</span>
                  </button>

                  <button
                    onClick={() => goToPara(currentPara + 1)}
                    aria-label="Next paragraph"
                    className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400 dark:text-slate-500">{progressPct}%</div>
                  <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4 dark:bg-slate-700" />
                  <div className="h-4 bg-slate-200 rounded w-5/6 dark:bg-slate-700" />
                  <div className="h-4 bg-slate-200 rounded w-2/3 dark:bg-slate-700" />
                </div>
              ) : (
                <article
                  ref={articleRef as any}
                  className="prose prose-sm max-w-none dark:prose-invert text-slate-800 dark:text-slate-100 overflow-auto max-h-64 p-2 rounded-md"
                >
                  {renderParagraphs()}
                </article>
              )}
            </div>

            <footer className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${error ? "bg-red-400" : loading ? "bg-yellow-400" : "bg-green-400"}`} aria-hidden />
                <span className="text-sm text-slate-600 dark:text-slate-400">{error ? error : loading ? "Loading..." : "Powered by AI"}</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={copyTip}
                  title="Copy tip"
                  aria-label="Copy tip"
                  whileTap={reduced ? undefined : { scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800/80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </motion.button>

                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{lastFetchedLabel}</span>
              </div>
            </footer>

            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
                className="absolute right-4 bottom-4 bg-slate-900/90 text-white text-sm px-3 py-1.5 rounded-md shadow"
                role="status"
              >
                {toast}
              </motion.div>
            )}
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default SecretDailyTips;
