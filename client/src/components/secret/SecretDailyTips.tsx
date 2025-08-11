import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/axios";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Share2,
  Copy,
  Check,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";

/**
 * SecretDailyTips - Modern, polished Daily AI Tip card with server-side caching
 *
 * Features:
 * - Server-side daily caching with automatic midnight refresh
 * - Client-side fresh tip option (bypasses cache)
 * - Animated countdown timer to next daily refresh
 * - Auto-typing animation with rich text support
 * - Modern, clean design with smooth animations
 * - Accessible and responsive
 * - Touch gestures for mobile interaction
 */

// Countdown timer component
const CountdownTimer: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      if (diff <= 0) {
        onComplete?.();
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    setIsVisible(true);
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: reduced ? 0 : 0.4 }}
      className="flex items-center justify-center gap-4 mt-6 p-4 bg-gradient-to-r from-indigo-50 to-pink-50 dark:from-indigo-950/30 dark:to-pink-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/50"
    >
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Next refresh in:</span>
      </div>
      
      <div className="flex items-center gap-2">
        {[{ label: 'H', value: timeLeft.hours }, { label: 'M', value: timeLeft.minutes }, { label: 'S', value: timeLeft.seconds }].map((unit, index) => (
          <React.Fragment key={unit.label}>
            <motion.div 
              className="flex flex-col items-center"
              animate={{ scale: unit.label === 'S' ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.6, repeat: unit.label === 'S' ? Infinity : 0 }}
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 min-w-[2.5rem] text-center shadow-sm">
                <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
                  {formatTime(unit.value)}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {unit.label}
              </span>
            </motion.div>
            {index < 2 && (
              <span className="text-slate-400 dark:text-slate-500 font-bold mb-4">:</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

// Rich text parsing and rendering utilities
interface RichTextToken {
  type: 'text' | 'bold' | 'italic' | 'code' | 'codeblock' | 'heading3' | 'link' | 'linebreak';
  content: string;
  url?: string;
  language?: string;
}

const parseRichText = (text: string): RichTextToken[] => {
  const tokens: RichTextToken[] = [];
  let currentIndex = 0;
  
  const patterns = [
    { regex: /^### (.+)$/gm, type: 'heading3' as const },
    { regex: /```([a-zA-Z]*)?\n?([\s\S]*?)```/g, type: 'codeblock' as const },
    { regex: /\*\*(.*?)\*\*/g, type: 'bold' as const },
    { regex: /\*(.*?)\*/g, type: 'italic' as const },
    { regex: /`(.*?)`/g, type: 'code' as const },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' as const },
  ];

  while (currentIndex < text.length) {
    let earliestMatch: RegExpExecArray | null = null;
    let earliestType: 'bold' | 'italic' | 'code' | 'codeblock' | 'heading3' | 'link' | null = null;
    let earliestPattern = null;

    // Find the earliest pattern match
    for (const pattern of patterns) {
      pattern.regex.lastIndex = currentIndex;
      const match = pattern.regex.exec(text);
      if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
        earliestMatch = match;
        earliestType = pattern.type;
        earliestPattern = pattern.regex;
      }
    }

    if (earliestMatch && earliestType) {
      // Add text before the match
      if (earliestMatch.index > currentIndex) {
        const beforeText = text.slice(currentIndex, earliestMatch.index);
        const lines = beforeText.split('\n');
        lines.forEach((line, i) => {
          if (i > 0) tokens.push({ type: 'linebreak', content: '' });
          if (line) tokens.push({ type: 'text', content: line });
        });
      }

      // Add the formatted token
      if (earliestType === 'link') {
        tokens.push({ 
          type: 'link', 
          content: earliestMatch[1], 
          url: earliestMatch[2] 
        });
      } else if (earliestType === 'codeblock') {
        tokens.push({ 
          type: 'codeblock', 
          content: earliestMatch[2] || '', 
          language: earliestMatch[1] || '' 
        });
      } else if (earliestType === 'heading3') {
        tokens.push({ 
          type: 'heading3', 
          content: earliestMatch[1] 
        });
      } else {
        tokens.push({ 
          type: earliestType, 
          content: earliestMatch[1] 
        });
      }

      currentIndex = earliestMatch.index + earliestMatch[0].length;
      
      // Reset all regex lastIndex
      patterns.forEach(p => p.regex.lastIndex = 0);
    } else {
      // No more patterns, add remaining text
      const remainingText = text.slice(currentIndex);
      const lines = remainingText.split('\n');
      lines.forEach((line, i) => {
        if (i > 0) tokens.push({ type: 'linebreak', content: '' });
        if (line) tokens.push({ type: 'text', content: line });
      });
      break;
    }
  }

  return tokens;
};

const renderRichTextToken = (token: RichTextToken, key: string) => {
  switch (token.type) {
    case 'heading3':
      return (
        <h3 
          key={key} 
          className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-6 mb-4 first:mt-0 border-b border-slate-200 dark:border-slate-700 pb-2"
        >
          {token.content}
        </h3>
      );
    case 'codeblock':
      return (
        <div key={key} className="my-4 first:mt-0 last:mb-0">
          <pre className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-x-auto shadow-sm">
            <code className="text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
              {token.content}
            </code>
          </pre>
          {token.language && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-2">
              {token.language}
            </div>
          )}
        </div>
      );
    case 'bold':
      return <strong key={key} className="font-bold text-slate-900 dark:text-slate-50">{token.content}</strong>;
    case 'italic':
      return <em key={key} className="italic text-slate-700 dark:text-slate-300">{token.content}</em>;
    case 'code':
      return (
        <code key={key} className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-md font-mono border border-slate-200 dark:border-slate-700">
          {token.content}
        </code>
      );
    case 'link':
      return (
        <a 
          key={key} 
          href={token.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline decoration-dotted underline-offset-2 transition-colors"
        >
          {token.content}
        </a>
      );
    case 'linebreak':
      return <br key={key} />;
    default:
      return <span key={key}>{token.content}</span>;
  }
};

// Enhanced typing animation component with rich text support
const TypingText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 35 }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsTyping(false);
      return;
    }

    setDisplayText('');
    setIsTyping(true);
    let currentIndex = 0;
    
    const typeWriter = () => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeWriter, speed + Math.random() * 30); // Add slight randomness
      } else {
        setIsTyping(false);
      }
    };

    const timer = setTimeout(typeWriter, 300); // Initial delay
    return () => clearTimeout(timer);
  }, [text, speed]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  // Parse and render the current display text with rich formatting
  const renderRichText = (text: string) => {
    const tokens = parseRichText(text);
    return tokens.map((token, index) => renderRichTextToken(token, `token-${index}`));
  };

  return (
    <span className="inline">
      {renderRichText(displayText)}
      {(isTyping || showCursor) && (
        <span className={`inline-block w-0.5 h-5 ml-0.5 bg-indigo-500 dark:bg-indigo-400 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
          |
        </span>
      )}
    </span>
  );
};

type Props = {
  className?: string;
  refreshInterval?: number | null;
  cacheTTL?: number;
};

const SESSION_KEY = "secret-daily-tip-v2";
const DEFAULT_TIP = `### Your Daily AI Tip
**AI features are now live!** This is a demo of the rich text capabilities.

*Enjoy seamless integration with your AI backend.*

Here is a code block example:
\`\`\`javascript
// Modern asynchronous function
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
\`\`\`

And here is some \`inline code\` for you to see. Visit our [documentation](https://example.com) for more info.`;

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
    async (opts?: { force?: boolean; fresh?: boolean }) => {
      const { force = false, fresh = false } = opts || {};
      
      // For fresh tips, skip cache entirely and use special endpoint
      if (fresh) {
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

        try {
          const res = await api.get("/chatbot/daily-tip/fresh", {
            signal,
            validateStatus: () => true,
          });

          const content =
            res?.data?.content || res?.data?.tip || (typeof res?.data === "string" ? res.data : undefined);

          if (res.status === 200 && content) {
            return { content: String(content), fetchedAt: Date.now(), isFresh: true };
          }
        } catch (err: any) {
          if (!signal.aborted) {
            console.warn("Fresh tip fetch failed, falling back to cached", err);
          }
        }
      }

      // Regular cached tip logic
      if (!force && !fresh) {
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
          // Use cached endpoint for daily tips (server-side caching)
          const endpoint = fresh ? "/chatbot/daily-tip/fresh" : "/chatbot/daily-tip/cached";
          const res = await api.get(endpoint, {
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
        if (!fresh) {
          writeCache(content);
        }
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
  const reduced = useReducedMotion();

  const lastFetchedLabel = useMemo(() => {
    return lastFetchedAt ? `Fetched ${formatDateShort(new Date(lastFetchedAt))}` : "";
  }, [lastFetchedAt]);

  const load = useCallback(
    async (opts?: { force?: boolean; fresh?: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchTip(opts);
        setTip(res.content);
        setLastFetchedAt(res.fetchedAt);
        setError(null);
        
        if (opts?.fresh) {
          setToast("Fresh tip generated!");
          setTimeout(() => setToast(null), 2000);
        }
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

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r") {
        e.preventDefault();
        load({ force: true });
      }
      if (e.key === "f") {
        e.preventDefault();
        load({ fresh: true });
      }
      if (e.key === "c") {
        e.preventDefault();
        copyTip();
      }
      if (e.key === "s") {
        e.preventDefault();
        shareTip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Touch gestures: swipe left to refresh, swipe right to share, long press to copy
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

  // Copy and share functions (keeping these for functionality)

  return (
    <div ref={containerRef} className={className} aria-live="polite" aria-atomic>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 -top-12 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/15 to-pink-300/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 w-64 h-64 rounded-full bg-gradient-to-bl from-cyan-300/10 to-indigo-400/15 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <header className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center gap-4 mb-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: reduced ? 0 : 0.5 }}
            >
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md" aria-hidden />
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Daily AI Tip
              </h2>
              <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
            <motion.p 
              className="text-slate-600 dark:text-slate-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: reduced ? 0 : 0.5 }}
            >
              Smart insights powered by AI
            </motion.p>
          </header>

          <motion.section
            role="region"
            aria-label="Daily AI tip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: reduced ? 0 : 0.6 }}
            whileHover={reduced ? undefined : { y: -4 }}
            className="relative bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
          >
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {loading ? "Generating..." : "Today's Insight"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{lastFetchedLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => load({ force: true })}
                  title="Refresh cached tip"
                  aria-label="Refresh cached tip"
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-sm hover:shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </motion.button>

                <motion.button
                  onClick={() => load({ fresh: true })}
                  title="Get fresh tip (bypass cache)"
                  aria-label="Get fresh tip"
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 text-amber-700 dark:text-amber-300 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shadow-sm hover:shadow-md"
                >
                  <Zap className="w-4 h-4" />
                  <span>Fresh</span>
                </motion.button>

                <motion.button
                  onClick={shareTip}
                  title="Share tip"
                  aria-label="Share tip"
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-sm hover:shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>
              </div>
            </div>

            <div className="relative">
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-slate-200 rounded-lg w-3/4 dark:bg-slate-700" />
                    <div className="h-5 bg-slate-200 rounded-lg w-full dark:bg-slate-700" />
                    <div className="h-5 bg-slate-200 rounded-lg w-5/6 dark:bg-slate-700" />
                  </div>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium text-lg">
                    <TypingText text={tip || DEFAULT_TIP} speed={30} />
                  </div>
                </div>
              )}
            </div>

            <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${error ? "bg-red-400" : loading ? "bg-yellow-400" : "bg-green-400"} shadow-sm`} aria-hidden />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {error ? error : loading ? "Loading..." : "Powered by AI"}
                </span>
              </div>

              <motion.button
                onClick={copyTip}
                title="Copy tip"
                aria-label="Copy tip"
                whileTap={reduced ? undefined : { scale: 0.95 }}
                whileHover={reduced ? undefined : { scale: 1.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-sm hover:shadow-md"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </motion.button>
            </footer>

            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
                className="absolute right-6 bottom-6 bg-slate-900/95 dark:bg-slate-800/95 text-white text-sm px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm border border-slate-700/50"
                role="status"
              >
                {toast}
              </motion.div>
            )}
          </motion.section>

          {/* Countdown Timer */}
          <CountdownTimer onComplete={() => load({ force: true })} />

          <motion.div 
            className="text-center mt-6 text-xs text-slate-400 dark:text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: reduced ? 0 : 0.5 }}
          >
            Keyboard shortcuts: R (refresh) • C (copy) • S (share) • F (fresh)
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SecretDailyTips;
