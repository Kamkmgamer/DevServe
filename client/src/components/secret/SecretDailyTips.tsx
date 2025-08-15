import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/axios";
import { motion, useReducedMotion } from "framer-motion";
import {
  RefreshCw,
  Share2,
  Copy,
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
const TimeUnit: React.FC<{ label: 'H' | 'M' | 'S'; value: number; pulse?: boolean }> = React.memo(({ label, value, pulse = false }) => {
  const reduced = useReducedMotion();
  const formatTime = (v: number) => v.toString().padStart(2, '0');
  return (
    <div className="flex items-center">
      <motion.div
        className="flex flex-col items-center"
        animate={pulse && !reduced ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 0.6, repeat: pulse ? Infinity : 0 }}
      >
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 min-w-[2.5rem] text-center shadow-sm">
          <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
            {formatTime(value)}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {label}
        </span>
      </motion.div>
    </div>
  );
});

// compute next midnight once
const getNextMidnight = () => {
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getTimeParts = (deadline: Date) => {
  const now = Date.now();
  const diff = deadline.getTime() - now;
  const clamped = Math.max(0, diff);
  const hours = Math.floor(clamped / (1000 * 60 * 60));
  const minutes = Math.floor((clamped % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((clamped % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, remainingMs: clamped };
};

const TimeUnitTicker: React.FC<{
  label: 'H' | 'M' | 'S';
  deadline: Date;
  pulse?: boolean;
  onComplete?: () => void; // used only on seconds
}> = React.memo(({ label, deadline, pulse, onComplete }) => {
  const [value, setValue] = useState(() => getTimeParts(deadline)[label === 'H' ? 'hours' : label === 'M' ? 'minutes' : 'seconds']);
  const completedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const parts = getTimeParts(deadline);
      const nextVal = label === 'H' ? parts.hours : label === 'M' ? parts.minutes : parts.seconds;
      setValue((prev) => (prev !== nextVal ? nextVal : prev));
      if (!completedRef.current && parts.remainingMs === 0 && label === 'S') {
        completedRef.current = true;
        onComplete?.();
      }
    };
    const id = window.setInterval(tick, 1000);
    // run once immediately so UI updates quickly
    tick();
    return () => window.clearInterval(id);
  }, [deadline, label, onComplete]);

  return <TimeUnit label={label} value={value} pulse={pulse} />;
});

const CountdownTimerComponent: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const reduced = useReducedMotion();
  // compute deadline once so parent stays static
  const deadline = useMemo(() => getNextMidnight(), []);

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
        <TimeUnitTicker label="H" deadline={deadline} />
        <span className="text-slate-400 dark:text-slate-500 font-bold mb-4">:</span>
        <TimeUnitTicker label="M" deadline={deadline} />
        <span className="text-slate-400 dark:text-slate-500 font-bold mb-4">:</span>
        <TimeUnitTicker label="S" deadline={deadline} pulse={!reduced} onComplete={onComplete} />
      </div>
    </motion.div>
  );
};
const CountdownTimer = React.memo(CountdownTimerComponent);

// Rich text parsing and rendering utilities
type RichTextTokenType = string; // broadened to avoid union mismatch errors across cases

interface RichTextToken {
  type: RichTextTokenType;
  content: string;
  // Optional fields for specific tokens
  url?: string;
  alt?: string;
  language?: string; // for codeblock
}

// Helper to parse inline markdown within a single line (no newlines)
const parseInline = (line: string): RichTextToken[] => {
  const out: RichTextToken[] = [];
  let i = 0;
  const patterns: { type: string; regex: RegExp }[] = [
    { type: 'image', regex: /!\[([^\]]*)\]\(([^)]+)\)/g },
    { type: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/g },
    { type: 'code', regex: /`([^`]+?)`/g },
    { type: 'bold', regex: /\*\*([^*]+)\*\*/g },
    { type: 'underline', regex: /__([^_]+)__/g },
    { type: 'strikethrough', regex: /~~([^~]+)~~/g },
    { type: 'italic', regex: /\*([^*]+)\*/g },
  ];

  while (i < line.length) {
    let earliest: { type: RichTextTokenType; match: RegExpExecArray } | null = null;
    for (const p of patterns) {
      p.regex.lastIndex = i;
      const m = p.regex.exec(line);
      if (m && (earliest === null || m.index < earliest.match.index)) {
        earliest = { type: p.type, match: m };
      }
    }

    if (!earliest) {
      out.push({ type: 'text', content: line.slice(i) });
      break;
    }

    if (earliest.match.index > i) {
      out.push({ type: 'text', content: line.slice(i, earliest.match.index) });
    }

    const [full, g1, g2] = earliest.match;
    switch (earliest.type) {
      case 'image':
        out.push({ type: 'image', content: g1 || '', url: g2 });
        break;
      case 'link':
        out.push({ type: 'link', content: g1, url: g2 });
        break;
      case 'code':
        out.push({ type: 'code', content: g1 });
        break;
      case 'bold':
      case 'underline':
      case 'strikethrough':
      case 'italic':
        out.push({ type: earliest.type, content: g1 });
        break;
      default:
        out.push({ type: 'text', content: full });
        break;
    }
    i = earliest.match.index + full.length;
  }

  return out;
};

// Main parser supporting blocks and line-level features
const parseRichText = (text: string): RichTextToken[] => {
  const tokens: RichTextToken[] = [];
  let pos = 0;

  const codeBlockRe = /```([\w+-]*)?\n?([\s\S]*?)(?:```|$)/g;
  let m: RegExpExecArray | null;
  while ((m = codeBlockRe.exec(text)) !== null) {
    const start = m.index;
    if (start > pos) {
      // Parse preceding non-code block segment
      const segment = text.slice(pos, start);
      const lines = segment.split('\n');
      lines.forEach((line, idx) => {
        if (idx > 0) tokens.push({ type: 'linebreak', content: '' });
        // Block-level detections
        const h = /^(#{1,6})\s+(.*)$/.exec(line);
        if (h) {
          const level = h[1].length as 1 | 2 | 3 | 4 | 5 | 6;
          tokens.push({ type: (`heading${level}` as RichTextTokenType), content: h[2] });
          return;
        }
        if (/^---\s*$/.test(line)) { tokens.push({ type: 'horizontalrule', content: '' }); return; }
        const bq = /^>\s+(.*)$/.exec(line);
        if (bq) { tokens.push({ type: 'blockquote', content: bq[1] }); return; }
        const li = /^(?:[*+-]|\d+\.)\s+(.*)$/.exec(line);
        if (li) { tokens.push({ type: 'listitem', content: li[1] }); return; }
        // Inline within normal paragraph line
        tokens.push(...parseInline(line));
      });
    }
    // Code block token
    tokens.push({ type: 'codeblock', content: m[2] || '', language: m[1] || '' });
    pos = m.index + m[0].length;
  }

  if (pos < text.length) {
    const segment = text.slice(pos);
    const lines = segment.split('\n');
    lines.forEach((line, idx) => {
      if (idx > 0) tokens.push({ type: 'linebreak', content: '' });
      const h = /^(#{1,6})\s+(.*)$/.exec(line);
      if (h) { const level = h[1].length as 1|2|3|4|5|6; tokens.push({ type: (`heading${level}` as RichTextTokenType), content: h[2] }); return; }
      if (/^---\s*$/.test(line)) { tokens.push({ type: 'horizontalrule', content: '' }); return; }
      const bq = /^>\s+(.*)$/.exec(line);
      if (bq) { tokens.push({ type: 'blockquote', content: bq[1] }); return; }
      const li = /^(?:[*+-]|\d+\.)\s+(.*)$/.exec(line);
      if (li) { tokens.push({ type: 'listitem', content: li[1] }); return; }
      tokens.push(...parseInline(line));
    });
  }

  return tokens;
};

const renderRichTextToken = (token: RichTextToken, key: string) => {
  switch (token.type) {
    // All heading levels
    case 'heading1':
      return (
        <h1 
          key={key} 
          className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-8 mb-6 first:mt-0 border-b-2 border-indigo-200 dark:border-indigo-800 pb-3"
        >
          {parseRichText(token.content).map((t, i) => renderRichTextToken(t, `${key}-h1-${i}`))}
        </h1>
      );
    case 'heading2':
      return (
        <h2 
          key={key} 
          className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-7 mb-5 first:mt-0 border-b border-slate-200 dark:border-slate-700 pb-2"
        >
          {parseRichText(token.content).map((t, i) => renderRichTextToken(t, `${key}-h2-${i}`))}
        </h2>
      );
    case 'heading3':
      return (
        <h3 
          key={key} 
          className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-6 mb-4 first:mt-0 border-b border-slate-200 dark:border-slate-700 pb-2"
        >
          {parseRichText(token.content).map((t, i) => renderRichTextToken(t, `${key}-h3-${i}`))}
        </h3>
      );
    case 'heading4':
      return (
        <h4 
          key={key} 
          className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-5 mb-3 first:mt-0"
        >
          {parseRichText(token.content).map((t, i) => renderRichTextToken(t, `${key}-h4-${i}`))}
        </h4>
      );
    case 'heading5':
      return (
        <h5 
          key={key} 
          className="text-base font-bold text-slate-900 dark:text-slate-50 mt-4 mb-2 first:mt-0"
        >
          {parseRichText(token.content).map((t, i) => renderRichTextToken(t, `${key}-h5-${i}`))}
        </h5>
      );
    case 'heading6':
      return (
        <h6 
          key={key} 
          className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-4 mb-2 first:mt-0 uppercase tracking-wide"
        >
          {parseRichText(token.content).map((t, i) => renderRichTextToken(t, `${key}-h6-${i}`))}
        </h6>
      );
    
    // Code blocks
    case 'codeblock':
      return (
        <div key={key} className="my-4 first:mt-0 last:mb-0 not-prose">
          <div className="relative group">
            {/* Header overlay with language and copy button */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 sm:px-4 py-2 pointer-events-none">
              <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 select-none">
                {token.language || 'code'}
              </span>
              <button
                type="button"
                aria-label="Copy code"
                title="Copy code"
                onClick={(e) => {
                  e.preventDefault();
                  const btn = e.currentTarget as HTMLButtonElement;
                  const prev = btn.innerText;
                  const toCopy = token.content || '';
                  const doCopy = async () => {
                    try {
                      if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(toCopy);
                      } else {
                        const ta = document.createElement('textarea');
                        ta.value = toCopy;
                        ta.style.position = 'fixed';
                        ta.style.left = '-9999px';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                      }
                      btn.innerText = 'Copied';
                      window.dispatchEvent(new CustomEvent('code-copied', { detail: { msg: 'Code copied' } }));
                      setTimeout(() => { btn.innerText = prev; }, 1200);
                    } catch {
                      btn.innerText = 'Failed';
                      setTimeout(() => { btn.innerText = prev; }, 1200);
                    }
                  };
                  void doCopy();
                }}
                className="pointer-events-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white dark:hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Copy
              </button>
            </div>

            <pre className="custom-scrollbar bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pt-8 p-3 sm:p-4 overflow-auto max-w-full max-h-60 sm:max-h-none shadow-sm">
              <code className="block min-w-full text-[11px] sm:text-sm md:text-[0.95rem] font-mono text-slate-800 dark:text-slate-200 leading-relaxed not-prose">
                {token.content}
              </code>
            </pre>
          </div>
        </div>
      );
    
    // Text formatting
    case 'bold':
      return <strong key={key} className="font-extrabold text-slate-900 dark:text-slate-50">{token.content}</strong>;
    case 'italic':
      return <em key={key} className="italic text-slate-800 dark:text-slate-200">{token.content}</em>;
    case 'underline':
      return <u key={key} className="underline decoration-slate-400 dark:decoration-slate-500 underline-offset-2">{token.content}</u>;
    case 'code':
      return (
        <code
          key={key}
          className="align-baseline font-mono text-[0.9em] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words"
        >
          {token.content}
        </code>
      );
    case 'strikethrough':
      return <del key={key} className="line-through text-slate-500 dark:text-slate-400">{token.content}</del>;
    
    // Links and images
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
    case 'image':
      return (
        <div key={key} className="my-4 first:mt-0 last:mb-0">
          <img 
            src={token.url} 
            alt={token.alt || token.content} 
            className="max-w-full h-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
          {token.content && (
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center italic">
              {token.content}
            </div>
          )}
        </div>
      );
    
    // Blockquotes
    case 'blockquote':
      return (
        <blockquote 
          key={key} 
          className="my-4 first:mt-0 last:mb-0 pl-4 py-2 border-l-4 border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 italic text-slate-700 dark:text-slate-300 rounded-r-lg"
        >
          {parseRichText(token.content).map((t, i) => renderRichTextToken(t, `${key}-bq-${i}`))}
        </blockquote>
      );
    
    // List items
    case 'listitem':
      return (
        <div key={key} className="flex items-start gap-3 my-2 first:mt-0 last:mb-0">
          <span className="text-indigo-500 dark:text-indigo-400 font-bold mt-0.5">•</span>
          <span className="text-slate-700 dark:text-slate-300">
            {parseRichText(token.content).map((t, i) => renderRichTextToken(t, `${key}-li-${i}`))}
          </span>
        </div>
      );
    
    // Horizontal rule
    case 'horizontalrule':
      return (
        <hr 
          key={key} 
          className="my-6 first:mt-0 last:mb-0 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"
        />
      );
    
    // Line breaks
    case 'linebreak':
      return <br key={key} />;
    
    // Default text
    default:
      return <span key={key} className="text-slate-700 dark:text-slate-300">{token.content}</span>;
  }
};

// Enhanced typing animation component with rich text support (optimized)
const TypingTextComponent: React.FC<{ text: string; speed?: number; active?: boolean }> = ({ text, speed = 14, active = true }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const reduced = useReducedMotion();
  const timeoutRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const clear = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (!active) {
      clear();
      return () => clear();
    }
    if (!text) {
      setDisplayText('');
      setIsTyping(false);
      clear();
      return () => clear();
    }

    if (reduced) {
      // Instantly render full text when reduced motion is preferred
      setDisplayText(text);
      setIsTyping(false);
      clear();
      return () => clear();
    }

    setDisplayText('');
    setIsTyping(true);
    let currentIndex = 0;

    const effectiveDelay = Math.max(8, speed); // clamp to avoid too many timers

    const typeWriter = () => {
      if (cancelledRef.current) return;
      if (currentIndex < text.length) {
        // Guard against state updates after unmount
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutRef.current = window.setTimeout(typeWriter, effectiveDelay);
      } else {
        setIsTyping(false);
        clear();
      }
    };

    timeoutRef.current = window.setTimeout(typeWriter, 200); // Initial delay

    return () => {
      cancelledRef.current = true;
      clear();
    };
  }, [text, speed, reduced, active]);

  // Cursor uses CSS animation to avoid state-driven re-renders

  // Sanitize partially-typed markdown to avoid showing raw markers (e.g., a single trailing **)
  const sanitizeForTyping = (input: string) => {
    if (!input) return input;

    // Temporarily protect fenced code blocks so we don't alter markers inside them
    const codeBlocks: string[] = [];
    const protectedText = input.replace(/```[\s\S]*?```/g, (m) => {
      codeBlocks.push(m);
      return `\uE000${codeBlocks.length - 1}\uE001`;
    });

    let text = protectedText;

    // If there's an unterminated fenced code block (odd number of ```), temporarily close it
    const fenceMatches = text.match(/```/g) || [];
    if (fenceMatches.length % 2 === 1) {
      // add a closing fence so parser treats it as a complete block
      text += "\n```";
    }

    // If there's an odd number of backticks, we're mid-typing an inline code block.
    // Temporarily add a closing backtick at the end to make it a valid, parsable token.
    const inlineBackticks = (text.match(/`/g) || []).length;
    if (inlineBackticks % 2 === 1) {
      text += '`';
    }

    // Fix unmatched bold markers (**)
    const boldMatches = text.match(/\*\*/g) || [];
    if (boldMatches.length % 2 === 1) {
      const lastIdx = text.lastIndexOf("**");
      if (lastIdx !== -1) {
        text = text.slice(0, lastIdx) + text.slice(lastIdx + 2);
      }
    }

    // Restore fenced code blocks
    text = text.replace(/\uE000(\d+)\uE001/g, (_m, idx) => codeBlocks[Number(idx)]);

    return text;
  };

  // Parse and render FULL text with rich formatting (only when typing completes)
  const fullRich = useMemo(() => {
    const tokens = parseRichText(text || '');
    return tokens.map((token, index) => renderRichTextToken(token, `token-${index}`));
  }, [text]);

  // While typing, render a sanitized, partially-formatted version for good UX
  const partialRich = useMemo(() => {
    const sanitized = sanitizeForTyping(displayText || '');
    const tokens = parseRichText(sanitized);
    return tokens.map((t, i) => renderRichTextToken(t, `partial-${i}`));
  }, [displayText]);

  return (
    <div className="inline-block align-middle w-full">
      {isTyping ? (
        <>
          {partialRich}
          {!reduced && (
            <span
              className="inline-block w-0.5 h-5 ml-0.5 bg-indigo-500 dark:bg-indigo-400 animate-pulse"
              aria-hidden
            />
          )}
        </>
      ) : (
        <>{fullRich}</>
      )}
    </div>
  );
};
const TypingText = React.memo(TypingTextComponent);

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [everInView, setEverInView] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const toastTimerRef = useRef<number | null>(null);

  // Toast: listen for global copy events from code blocks and copy actions
  useEffect(() => {
    const onCopied = (e: Event) => {
      const ce = e as CustomEvent<{ msg?: string }>;
      const msg = ce?.detail?.msg || "Copied to clipboard";
      setToastMsg(msg);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => setToastMsg(""), 1600);
    };
    window.addEventListener("code-copied", onCopied as EventListener);
    return () => {
      window.removeEventListener("code-copied", onCopied as EventListener);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const lastFetchedLabel = useMemo(() => {
    return lastFetchedAt ? `Fetched ${formatDateShort(new Date(lastFetchedAt))}` : "";
  }, [lastFetchedAt]);

  const load = useCallback(
    async (opts?: { force?: boolean; fresh?: boolean }) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchTip(opts);
        setTip(res.content);
        setLastFetchedAt(res.fetchedAt);
        setError(null);
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

  const handleCountdownComplete = useCallback(() => {
    load({ force: true });
  }, [load]);

  // Defer typing until content is in view to reduce CPU
  useEffect(() => {
    const el = contentRef.current ?? containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setEverInView(true);
      },
      { root: null, rootMargin: '0px 0px -25% 0px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r") {
        e.preventDefault();
        if (!loading) load({ force: true });
      }
      if (e.key === "f") {
        e.preventDefault();
        if (!loading) load({ fresh: true });
      }
      if (e.key === "c") {
        e.preventDefault();
        if (!loading) copyRaw(tip);
      }
      if (e.key === "s") {
        e.preventDefault();
        if (!loading) shareRaw(tip);
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
        // long press: copy tip (stateless)
        void copyRaw(tip);
      }, 650) as unknown as number;
    };

    const onTouchMove = (ev: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const onTouchEnd = (ev: TouchEvent) => {
      if (loading) return;
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
        } else {
          // swipe right: share
          void shareRaw(tip);
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
  const copyRaw = useCallback(async (text: string) => {
    if (!text) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      // Fire global toast event
      window.dispatchEvent(new CustomEvent("code-copied", { detail: { msg: "Copied to clipboard" } }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const shareRaw = useCallback(async (text: string) => {
    if (!text) return false;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Daily AI Tip", text });
        return true;
      } catch {
        return false;
      }
    } else {
      return await copyRaw(text);
    }
  }, [copyRaw]);

  // Copy and share functions (keeping these for functionality)

  // Inject custom scrollbar styles once
  useEffect(() => {
    const id = 'custom-code-scrollbar-style';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      .custom-scrollbar{ scrollbar-width: thin; scrollbar-color: rgba(100,116,139,0.6) transparent; }
      .custom-scrollbar::-webkit-scrollbar{ height: 10px; width: 10px; }
      .custom-scrollbar::-webkit-scrollbar-track{ background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb{ background-color: rgba(100,116,139,0.6); border-radius: 9999px; border: 2px solid transparent; background-clip: content-box; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover{ background-color: rgba(100,116,139,0.8); }
      .dark .custom-scrollbar{ scrollbar-color: rgba(148,163,184,0.5) transparent; }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb{ background-color: rgba(148,163,184,0.5); }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover{ background-color: rgba(148,163,184,0.7); }
    `;
    document.head.appendChild(style);
  }, []);

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
          className="max-w-4xl mx-auto px-4 sm:px-6"
        >
          <header className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center gap-2 sm:gap-4 mb-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: reduced ? 0 : 0.5 }}
            >
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md" aria-hidden />
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Daily AI Tip
              </h2>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
            <motion.p 
              className="text-slate-600 dark:text-slate-400 text-base sm:text-lg"
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
            className="relative bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                    {loading ? "Generating..." : "Today's Insight"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{lastFetchedLabel}</p>
                </div>
              </div>

              <div className="flex flex-wrap w-full sm:w-auto items-center gap-2 sm:gap-3 mt-4 sm:mt-0 justify-start sm:justify-end">
                <motion.button
                  onClick={() => load({ force: true })}
                  title="Refresh cached tip"
                  aria-label="Refresh cached tip"
                  disabled={loading}
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  className={`inline-flex items-center gap-2 w-full sm:w-auto px-3 py-2 text-xs sm:text-sm sm:px-4 font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-sm hover:shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </motion.button>

                <motion.button
                  onClick={() => load({ fresh: true })}
                  title="Get fresh tip (bypass cache)"
                  aria-label="Get fresh tip"
                  disabled={loading}
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  className={`inline-flex items-center gap-2 w-full sm:w-auto px-3 py-2 text-xs sm:text-sm sm:px-4 font-medium rounded-xl border border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 text-amber-700 dark:text-amber-300 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shadow-sm hover:shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Fresh</span>
                </motion.button>

                <motion.button
                  onClick={() => shareRaw(tip)}
                  title="Share tip"
                  aria-label="Share tip"
                  disabled={loading || !tip}
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  className={`inline-flex items-center gap-2 w-full sm:w-auto px-3 py-2 text-xs sm:text-sm sm:px-4 font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-sm hover:shadow-md ${(loading || !tip) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <div className="prose prose-base sm:prose-lg max-w-none dark:prose-invert">
                  <div ref={contentRef} className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium text-base sm:text-lg break-words">
                    <TypingText text={tip || DEFAULT_TIP} speed={12} active={inView || everInView} />
                  </div>
                </div>
              )}
            </div>

            <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 sm:gap-0 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`${error ? "bg-red-400" : loading ? "bg-yellow-400" : "bg-green-400"} shadow-sm w-3 h-3 rounded-full`} aria-hidden />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {error ? error : loading ? "Loading..." : "Powered by AI"}
                </span>
              </div>

              <motion.button
                onClick={() => copyRaw(tip)}
                title="Copy tip"
                aria-label="Copy tip"
                disabled={loading || !tip}
                whileTap={reduced ? undefined : { scale: 0.95 }}
                whileHover={reduced ? undefined : { scale: 1.05 }}
                className={`inline-flex items-center gap-2 w-full sm:w-auto px-3 py-2 text-xs sm:text-sm sm:px-4 font-medium rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-sm hover:shadow-md ${(loading || !tip) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </motion.button>
            </footer>
          </motion.section>

          {/* Countdown Timer */}
          <CountdownTimer onComplete={handleCountdownComplete} />

          <motion.div 
            className="text-center mt-6 text-xs text-slate-400 dark:text-slate-500 hidden sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: reduced ? 0 : 0.5 }}
          >
            Keyboard shortcuts: R (refresh) • C (copy) • S (share) • F (fresh)
          </motion.div>
        </motion.div>
      </div>
      {/* Toast */}
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 10 }}
        animate={toastMsg ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg border text-xs sm:text-sm ${toastMsg ? 'pointer-events-auto' : 'pointer-events-none'} bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100`}
      >
        {toastMsg}
      </motion.div>
    </div>
  );
};

export default React.memo(SecretDailyTips);
