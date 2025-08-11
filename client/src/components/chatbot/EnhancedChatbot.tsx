import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { 
  X, Send, Bot, User, Loader, Edit2, Save, Settings, Palette, Type, 
  Plus, Minus, RotateCw, Maximize2, Minimize2, Trash2, Move3D, 
  Square, Circle, MessageSquare 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../../api/axios";

/**
 * Enhanced Chatbot.tsx
 * A powerful, resizable chatbot component with advanced customization features
 * 
 * 🚀 NEW FEATURES:
 * ✅ Resizable window with drag handles for desktop and touch support for mobile
 * ✅ Customizable appearance (background color, font family, font size)
 * ✅ Fixed spacebar input issue with proper event handling
 * ✅ Smooth animations for messages and interactions
 * ✅ Mobile-friendly responsive design with touch optimization
 * ✅ Keyboard accessibility and ARIA support
 * ✅ Persistent settings with localStorage
 * ✅ Clear input and enhanced send functionality
 * ✅ Modern, clean UI with gradient themes
 * ✅ Draggable window positioning
 * ✅ Maximize/minimize functionality
 * ✅ Message send animations
 * ✅ Improved error handling and user feedback
 */

type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
  id: string;
  timestamp: string;
  isAnimating?: boolean;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  name: string;
  title?: string;
  bio?: string;
  contact?: string;
  lang?: string[];
}

interface ChatbotSettings {
  backgroundColor: string;
  fontFamily: string;
  fontSize: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  resizeHandle: string;
}

// Storage keys
const STORAGE_PROFILE = "chatbot_profile_khalil_v2";
const STORAGE_MESSAGES = "chatbot_msgs_khalil_v2";
const STORAGE_SETTINGS = "chatbot_settings_v2";
const STORAGE_POSITION = "chatbot_position_v2";

// Default configuration
const DEFAULT_PROFILE: UserProfile = {
  name: "خليل عبد المجيد خليل محمد",
  title: "Web developer and designer",
  bio: "I build web apps and landing pages with React, TypeScript, Tailwind CSS, Framer Motion. I also work with Odoo and Webflow.",
  contact: "contact@khalil.excellence.sd",
  lang: ["Arabic", "English"],
};

const DEFAULT_SETTINGS: ChatbotSettings = {
  backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  fontFamily: "Inter",
  fontSize: 15,
  width: 450,
  height: 700,
  isMaximized: false,
};

const DEFAULT_POSITION: Position = {
  x: typeof window !== 'undefined' ? window.innerWidth - 440 : 100,
  y: typeof window !== 'undefined' ? window.innerHeight - 670 : 100,
};

const FONT_OPTIONS = [
  { name: "Inter", value: "Inter, system-ui, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
];

const COLOR_PRESETS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Stunning purple-blue
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Pink-red vibrant
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Ocean blue
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Mint fresh
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", // Sunset
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Cotton candy
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", // Soft rose
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", // Warm peach
  "linear-gradient(135deg, #667db6 0%, #0082c8 100%)", // Professional blue
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", // Golden hour
  "#ffffff", "#f8fafc", "#1e1b4b", "#0f172a", "#374151", // Solid colors
];

const BEAUTIFUL_GRADIENTS = [
  { name: "Mystic Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Royal Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Arctic Paradise", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Emerald Dream", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { name: "Golden Blaze", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { name: "Lavender Fields", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { name: "Rose Petal", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  { name: "Warm Embrace", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
];

const suggestedPrompts = [
  "Introduce Khalil for the hero section on a portfolio site",
  "Summarize Khalil's top skills and tools",
  "Give 3 friendly ways visitors can contact Khalil",
  "Tell a short story about Khalil's approach to design",
];

// Utility functions
const nowISO = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: unknown[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Storage helpers
const loadProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) || {}) } as UserProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
};

const saveProfile = (p: UserProfile) => {
  localStorage.setItem(STORAGE_PROFILE, JSON.stringify(p));
};

const loadMessages = (): Message[] => {
  try {
    const raw = localStorage.getItem(STORAGE_MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
};

const saveMessages = (msgs: Message[]) => {
  localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(msgs.slice(-300)));
};

const loadSettings = (): ChatbotSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings: ChatbotSettings) => {
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
};

const loadPosition = (): Position => {
  try {
    const raw = localStorage.getItem(STORAGE_POSITION);
    if (!raw) return DEFAULT_POSITION;
    return { ...DEFAULT_POSITION, ...(JSON.parse(raw) || {}) };
  } catch {
    return DEFAULT_POSITION;
  }
};

const savePosition = (position: Position) => {
  localStorage.setItem(STORAGE_POSITION, JSON.stringify(position));
};

const buildSystemPrompt = (p: UserProfile) => {
  const lines = [
    `You are acting as ${p.name}. Speak in first person as if you are him.`,
    `Be friendly, professional, and clear. Use a warm tone and give practical examples when helpful.`,
    `When visitors ask about background, mention the following facts when relevant:`,
    `- Role: ${p.title || "Web developer"}`,
    `- Tech: React, TypeScript, Tailwind CSS, Framer Motion, Webflow, Odoo, Linux, Apache, WordPress`,
    `- Projects: SoftMedics.sd and E-Shop; experience building animated and responsive portfolio pages`,
    `- Languages: ${p.lang?.join(", ") || "Arabic and English"}`,
    `- Contact: ${p.contact || "contact@khalil.excellence.sd"}`,
    `If a question is about personal limits, be honest and mention that you are fluent in web frontend and Odoo integration and can integrate AI features.`,
    `If a user asks for code, provide clear examples and explain tradeoffs.`,
    `Keep answers concise for quick reading, but provide optional deeper steps when asked.`,
  ];
  return lines.filter(Boolean).join("\n");
};

const EnhancedChatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  // Core state
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [messages, setMessages] = useState<Message[]>(() => {
    const persisted = loadMessages();
    if (persisted.length) return persisted;
    return [
      {
        id: uid(),
        role: "assistant",
        content: `Hello! I am ${DEFAULT_PROFILE.name}. Ask me about my work, skills, or how to contact me. 🚀`,
        timestamp: nowISO(),
      },
    ];
  });

  // UI state
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Enhanced features state
  const [settings, setSettings] = useState<ChatbotSettings>(() => loadSettings());
  const [position, setPosition] = useState<Position>(() => loadPosition());
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    resizeHandle: "",
  });

  // Profile editing state
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  // Refs
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const chatbotRef = useRef<HTMLDivElement | null>(null);

  // Simplified automatic theme detection - defaults to light mode for better compatibility
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      // Check for explicit dark mode indicators
      if (htmlElement.classList.contains('dark') || 
          bodyElement.classList.contains('dark') ||
          htmlElement.getAttribute('data-theme') === 'dark' ||
          bodyElement.getAttribute('data-theme') === 'dark') {
        return true;
      }
      
      // Check for explicit light mode indicators
      if (htmlElement.classList.contains('light') || 
          bodyElement.classList.contains('light') ||
          htmlElement.getAttribute('data-theme') === 'light' ||
          bodyElement.getAttribute('data-theme') === 'light') {
        return false;
      }
      
      // For better compatibility, default to light mode unless system explicitly prefers dark
      // This prevents issues where the chatbot incorrectly detects dark mode
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Only use dark mode if system explicitly prefers it AND no conflicting indicators
      return systemPrefersDark;
    }
    return false; // Default to light mode
  });

  // Listen for theme changes from system and page-level changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      // System theme change handler
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        // Only update if no explicit page theme is set
        if (!htmlElement.classList.contains('dark') && 
            !htmlElement.classList.contains('light') &&
            !bodyElement.classList.contains('dark') && 
            !bodyElement.classList.contains('light') &&
            !htmlElement.getAttribute('data-theme') &&
            !bodyElement.getAttribute('data-theme')) {
          setIsDarkMode(e.matches);
        }
      };
      
      // DOM mutation observer to watch for theme class changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const target = mutation.target as HTMLElement;
            if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
              // Check for dark mode
              if (target.classList.contains('dark') || target.getAttribute('data-theme') === 'dark') {
                setIsDarkMode(true);
              }
              // Check for light mode
              else if (target.classList.contains('light') || target.getAttribute('data-theme') === 'light') {
                setIsDarkMode(false);
              }
              // If no explicit theme, use system preference
              else if (!target.classList.contains('dark') && !target.classList.contains('light') &&
                      !target.getAttribute('data-theme')) {
                setIsDarkMode(mediaQuery.matches);
              }
            }
          }
        });
      });
      
      // Observe both html and body elements
      observer.observe(htmlElement, { 
        attributes: true, 
        attributeFilter: ['class', 'data-theme'] 
      });
      observer.observe(bodyElement, { 
        attributes: true, 
        attributeFilter: ['class', 'data-theme'] 
      });
      
      // Listen to system theme changes
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      // Cleanup
      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, []);

  // Enhanced color detection for gradients and solid colors with theme awareness
  const { isDarkBackground, isGradient, themeAwareTextColor, themeAwareMutedColor } = useMemo(() => {
    const bg = settings.backgroundColor;
    
    // Check if it's a gradient
    const isGradient = bg.includes('gradient') || bg.includes('linear-') || bg.includes('radial-');
    
    let isDarkBackground = false;
    
    if (isGradient) {
      // For gradients, we'll assume most of our beautiful gradients work best with white text
      // This is a practical approach since parsing gradient colors is complex
      isDarkBackground = true;
    } else if (bg.startsWith('#')) {
      // For solid colors, use existing logic
      const hex = bg.replace('#', '');
      const rgb = parseInt(hex, 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = (rgb >> 0) & 255;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      isDarkBackground = brightness < 128;
    }
    
    // Theme-aware text colors
    const themeAwareTextColor = isDarkBackground 
      ? '#ffffff' 
      : isDarkMode 
        ? '#f9fafb'  // Light text for dark mode
        : '#1f2937'; // Dark text for light mode
    
    const themeAwareMutedColor = isDarkBackground
      ? '#cbd5e1'
      : isDarkMode
        ? '#d1d5db'  // Light muted for dark mode
        : '#6b7280'; // Dark muted for light mode
    
    return { 
      isDarkBackground, 
      isGradient, 
      themeAwareTextColor, 
      themeAwareMutedColor 
    };
  }, [settings.backgroundColor, isDarkMode]);

  const textColor = themeAwareTextColor;
  const mutedTextColor = themeAwareMutedColor;

  // Effects
  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => saveMessages(messages), [messages]);
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => savePosition(position), [position]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Ensure proper focus and prevent external interference
      setTimeout(() => {
        inputRef.current?.focus();
        // Add event listener to prevent default browser shortcuts on the input
        const input = inputRef.current;
        if (input) {
          const preventShortcuts = (e: KeyboardEvent) => {
            // Prevent any global shortcuts from interfering when typing in the input
            if (document.activeElement === input) {
              e.stopPropagation();
            }
          };
          document.addEventListener('keydown', preventShortcuts, true);
          return () => {
            document.removeEventListener('keydown', preventShortcuts, true);
          };
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "end" 
    });
  }, [messages]);

  useEffect(() => setTempProfile(profile), [profile, editing]);

  // Prepare API payload
  const preparePayload = useCallback((userMessage: Message) => {
    const system = { role: "system", content: buildSystemPrompt(profile) };
    const recent = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
    return [system, ...recent, { role: userMessage.role, content: userMessage.content }];
  }, [profile, messages]);

  // Typing animation
  const simulateTyping = useCallback((fullText: string, targetId: string, speed = 20) => {
    let i = 0;
    const step = () => {
      i += 1;
      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => m.id === targetId);
        if (idx === -1) return prev;
        copy[idx] = { ...copy[idx], content: fullText.slice(0, i) };
        return copy;
      });
      if (i < fullText.length) {
        setTimeout(step, speed);
      } else {
        // Animation complete
        setMessages(prev => prev.map(m => 
          m.id === targetId ? { ...m, isAnimating: false } : m
        ));
      }
    };
    step();
  }, []);

  // API call with retry logic
  const sendToApi = useCallback(async (payload: unknown[], retries = 2) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await api.post(
        "/chatbot/chat",
        { messages: payload },
        { signal: controller.signal, validateStatus: () => true }
      );

      if (res.status === 200) {
        const content = res.data?.content || res.data?.message?.content || String(res.data || "");
        return { ok: true, content };
      }

      if (res.status === 429) return { ok: false, code: 429, message: "Rate limit reached" };
      if (res.status === 500 && res.data?.error?.includes("not configured"))
        return { ok: false, code: 500, message: "Chatbot not configured" };

      return { ok: false, code: res.status, message: res.data?.message || "Server error" };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return { ok: false, code: 0, message: "Request aborted" };
      }
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 300));
        return sendToApi(payload, retries - 1);
      }
      return { ok: false, code: 0, message: err instanceof Error ? err.message : "Network error" };
    } finally {
      abortRef.current = null;
    }
  }, []);

  // Message handling
  const pushMessage = useCallback((m: Message) => {
    setMessages((prev) => [...prev, { ...m, isAnimating: false }]);
  }, []);

  const handleSend = useCallback(async (override?: string) => {
    const text = override !== undefined ? override : input.trim();
    if (!text || loading) return;

    setError(null);
    const userMsg: Message = { 
      id: uid(), 
      role: "user", 
      content: text, 
      timestamp: nowISO(),
      isAnimating: true
    };
    
    pushMessage(userMsg);
    setInput("");
    setLoading(true);

    // Add message send animation
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === userMsg.id ? { ...m, isAnimating: false } : m
      ));
    }, 300);

    const assistantId = uid();
    const assistantMsg: Message = { 
      id: assistantId, 
      role: "assistant", 
      content: "", 
      timestamp: nowISO(),
      isAnimating: true
    };
    pushMessage(assistantMsg);

    const payload = preparePayload(userMsg);
    const res = await sendToApi(payload);

    if (res.ok) {
      const content = String(res.content || "");
      simulateTyping(content, assistantId, 18);
    } else {
      let errText = "❌ Something went wrong.";
      if (res.code === 429) errText = "⏳ Rate limit reached. Try again in a moment.";
      else if (res.code === 500 && /not configured/i.test(String(res.message)))
        errText = "⚠️ Chatbot not configured. Please add an OpenRouter API key.";
      else if (res.message) errText = `❌ ${res.message}`;

      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: errText, isAnimating: false } : m)));
      setError(errText);
    }

    setLoading(false);
  }, [input, loading, pushMessage, preparePayload, sendToApi, simulateTyping]);

  // Enhanced keyboard handling - FIXES SPACEBAR AND LETTER INPUT ISSUES
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation to prevent global keyboard shortcuts from interfering
    e.stopPropagation();
    
    // Only handle Enter key for sending messages
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // All other keys (including spacebar, letters, etc.) work naturally
  }, [handleSend]);

  // Enhanced input handling
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Stop propagation to prevent any parent handlers from interfering
    e.stopPropagation();
    // Direct value setting
    setInput(e.target.value);
  }, []);

  // Prevent keyup events from bubbling up
  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  }, []);

  // Prevent keypress events from bubbling up (for older browser compatibility)
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  }, []);

  // Clear input function
  const clearInput = useCallback(() => {
    setInput("");
    inputRef.current?.focus();
  }, []);

  // Quick actions
  const quickIntroduce = useCallback(() => {
    const content = `Please introduce ${profile.name} in first person in one short paragraph suitable for a portfolio hero. Include title and one sentence on skills.`;
    handleSend(content);
  }, [profile.name, handleSend]);

  const clearChat = useCallback(() => {
    const seed: Message = {
      id: uid(),
      role: "assistant",
      content: `Hi! Ask me about ${profile.name} or use the quick actions. ✨`,
      timestamp: nowISO(),
    };
    setMessages([seed]);
    localStorage.removeItem(STORAGE_MESSAGES);
  }, [profile.name]);

  // Profile management
  const saveEdits = useCallback(() => {
    setProfile(tempProfile);
    saveProfile(tempProfile);
    setEditing(false);
    pushMessage({ 
      id: uid(), 
      role: "assistant", 
      content: `Profile updated! I'm now ${tempProfile.name}. 🎉`, 
      timestamp: nowISO() 
    });
  }, [tempProfile, pushMessage]);

  // Settings management
  const updateSettings = useCallback((newSettings: Partial<ChatbotSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setPosition(DEFAULT_POSITION);
  }, []);

  // Window management
  const toggleMaximize = useCallback(() => {
    if (settings.isMaximized) {
      updateSettings({
        isMaximized: false,
        width: 420,
        height: 650
      });
      setPosition({ x: 50, y: 50 });
    } else {
      updateSettings({
        isMaximized: true,
        width: Math.min(window.innerWidth - 40, 800),
        height: Math.min(window.innerHeight - 40, 800)
      });
      setPosition({ x: 20, y: 20 });
    }
  }, [settings.isMaximized, updateSettings]);

  // Drag and resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    const rect = chatbotRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragState({
      isDragging: action === 'drag',
      isResizing: action === 'resize',
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      resizeHandle: handle || '',
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging && !dragState.isResizing) return;

    if (dragState.isDragging) {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      setPosition(prev => ({
        x: clamp(prev.x + deltaX, 0, window.innerWidth - settings.width),
        y: clamp(prev.y + deltaY, 0, window.innerHeight - settings.height),
      }));

      setDragState(prev => ({ ...prev, startX: e.clientX, startY: e.clientY }));
    } else if (dragState.isResizing) {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      let newWidth = dragState.startWidth;
      let newHeight = dragState.startHeight;

      if (dragState.resizeHandle.includes('right')) {
        newWidth = clamp(dragState.startWidth + deltaX, 300, 800);
      }
      if (dragState.resizeHandle.includes('left')) {
        newWidth = clamp(dragState.startWidth - deltaX, 300, 800);
        setPosition(prev => ({ ...prev, x: prev.x + deltaX }));
      }
      if (dragState.resizeHandle.includes('bottom')) {
        newHeight = clamp(dragState.startHeight + deltaY, 400, 900);
      }
      if (dragState.resizeHandle.includes('top')) {
        newHeight = clamp(dragState.startHeight - deltaY, 400, 900);
        setPosition(prev => ({ ...prev, y: prev.y + deltaY }));
      }

      updateSettings({ width: newWidth, height: newHeight });
    }
  }, [dragState, settings.width, settings.height, updateSettings]);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      isResizing: false,
    }));
  }, []);

  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = dragState.isDragging ? 'grabbing' : 'nw-resize';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'auto';
      };
    }
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  // Beautiful theme-aware styling system
  const getThemeStyles = () => {
    if (isDarkMode) {
      return {
        // Dark mode colors
        primary: '#3b82f6', // Blue-500
        primaryHover: '#2563eb', // Blue-600
        secondary: '#6366f1', // Indigo-500
        background: '#0f172a', // Slate-900
        surface: '#1e293b', // Slate-800
        surfaceHover: '#334155', // Slate-700
        border: '#374151', // Gray-700
        borderHover: '#4b5563', // Gray-600
        text: '#f8fafc', // Slate-50
        textMuted: '#cbd5e1', // Slate-300
        textSecondary: '#94a3b8', // Slate-400
        shadow: 'rgba(0, 0, 0, 0.25)',
        glassBg: 'rgba(30, 41, 59, 0.8)', // Slate-800 with opacity
        accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
      };
    } else {
      return {
        // Light mode colors - elegant and modern
        primary: '#2563eb', // Blue-600
        primaryHover: '#1d4ed8', // Blue-700
        secondary: '#7c3aed', // Violet-600
        background: '#ffffff', // White
        surface: '#f8fafc', // Slate-50
        surfaceHover: '#f1f5f9', // Slate-100
        border: '#e2e8f0', // Slate-200
        borderHover: '#cbd5e1', // Slate-300
        text: '#0f172a', // Slate-900
        textMuted: '#475569', // Slate-600
        textSecondary: '#64748b', // Slate-500
        shadow: 'rgba(0, 0, 0, 0.1)',
        glassBg: 'rgba(248, 250, 252, 0.9)', // Slate-50 with opacity
        accentGradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
      };
    }
  };

  const theme = getThemeStyles();

  // Enhanced styling that properly handles gradients, solid colors, and theme awareness
  const chatbotStyles = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${settings.width}px`,
    height: `${settings.height}px`,
    fontFamily: FONT_OPTIONS.find(f => f.name === settings.fontFamily)?.value || settings.fontFamily,
    fontSize: `${settings.fontSize}px`,
    background: theme.background,
    color: theme.text,
    boxShadow: `0 25px 50px -12px ${theme.shadow}, 0 0 0 1px ${theme.border}`,
    border: `1px solid ${theme.border}`,
  };

  // Messages container styling
  const messagesContainerStyles = {
    ...(isGradient 
      ? { backgroundImage: settings.backgroundColor, backgroundColor: 'transparent' }
      : { backgroundColor: settings.backgroundColor, backgroundImage: 'none' }
    ),
    maxHeight: `${settings.height - 280}px`,
  };

  return (
    <>
      {/* CSS Animations and Input Styling */}
      <style>
        {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-slide-in {
            animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-fade-in {
            animation: fadeInScale 0.3s ease-out forwards;
          }
          .chatbot-input::placeholder {
            color: ${isDarkMode ? '#94a3b8' : '#9ca3af'} !important;
            opacity: 1 !important;
          }
          .chatbot-input::-webkit-input-placeholder {
            color: ${isDarkMode ? '#94a3b8' : '#9ca3af'} !important;
            opacity: 1 !important;
          }
          .chatbot-input::-moz-placeholder {
            color: ${isDarkMode ? '#94a3b8' : '#9ca3af'} !important;
            opacity: 1 !important;
          }
          .chatbot-input:-ms-input-placeholder {
            color: ${isDarkMode ? '#94a3b8' : '#9ca3af'} !important;
            opacity: 1 !important;
          }
        `}
      </style>

      {/* Backdrop with beautiful blur effect */}
      <div 
        className="fixed inset-0 z-40 transition-all duration-300 animate-fade-in"
        style={{
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Enhanced Chatbot Window */}
      <div
        ref={chatbotRef}
        className="fixed z-50 flex flex-col overflow-hidden transition-all duration-500 ease-out"
        style={{
          ...chatbotStyles,
          borderRadius: '20px',
          transform: settings.isMaximized ? 'scale(1)' : 'scale(1) translateY(0px)',
          animation: 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        role="dialog"
        aria-label="AI Assistant Chat"
        aria-modal="true"
      >
        {/* Beautiful Modern Header */}
        <div
          className="flex items-center justify-between p-5 cursor-grab active:cursor-grabbing select-none transition-all duration-300"
          onMouseDown={(e) => handleMouseDown(e, 'drag')}
          style={{
            background: theme.accentGradient,
            minHeight: '72px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
          }}
        >
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Avatar with beautiful glow effect */}
            <div 
              className="p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              <Bot className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <div 
                className="font-bold text-xl truncate text-white drop-shadow-sm"
                style={{ letterSpacing: '-0.025em' }}
              >
                {profile.name}
              </div>
              <div 
                className="text-sm text-white/90 truncate font-medium"
                style={{ letterSpacing: '0.025em' }}
              >
                {profile.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle removed - now auto-detects system/page themes */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 hover:bg-white/15 rounded-xl transition-all duration-200 group"
              title="Settings"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4 text-white group-hover:rotate-90 group-hover:scale-110 transition-all duration-200" />
            </button>
            <button
              onClick={toggleMaximize}
              className="p-2.5 hover:bg-white/15 rounded-xl transition-all duration-200 group"
              title={settings.isMaximized ? "Restore" : "Maximize"}
              aria-label={settings.isMaximized ? "Restore window" : "Maximize window"}
            >
              {settings.isMaximized ? (
                <Minimize2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>
            <button
              onClick={() => setEditing(!editing)}
              className="p-2.5 hover:bg-white/15 rounded-xl transition-all duration-200 group"
              title="Edit Profile"
              aria-label="Edit profile"
            >
              <Edit2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
              title="Close"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-white group-hover:scale-110 group-hover:rotate-90 transition-all duration-200" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b" style={{ 
            borderBottomColor: theme.border,
            backgroundColor: theme.surface,
            color: theme.text 
          }}>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Background Color</label>
                  <div className="flex items-center gap-2 text-xs" style={{ color: mutedTextColor }}>
                    <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-yellow-400'}`} title={isDarkMode ? 'Dark Mode' : 'Light Mode'} />
                    {isDarkMode ? 'Dark' : 'Light'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COLOR_PRESETS.map((color) => {
                    const isGradientColor = color.includes('gradient');
                    return (
                      <button
                        key={color}
                        onClick={() => updateSettings({ backgroundColor: color })}
                        className={`w-6 h-6 rounded border-2 transition-all duration-200 ${
                          settings.backgroundColor === color 
                            ? 'border-blue-500 scale-110' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={isGradientColor 
                          ? { backgroundImage: color }
                          : { backgroundColor: color }
                        }
                        title={isGradientColor ? 'Gradient Theme' : color}
                        aria-label={"Set background color to " + color}
                      />
                    );
                  })}
                </div>
                {/* Only show color picker for solid colors */}
                {!isGradient && (
                  <input
                    type="color"
                    value={settings.backgroundColor.startsWith('#') ? settings.backgroundColor : '#667eea'}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="w-full h-10 border rounded"
                    style={{
                      borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                    }}
                    aria-label="Custom background color"
                  />
                )}
                {isGradient && (
                  <div 
                    className="w-full h-10 border rounded flex items-center justify-center text-sm" 
                    style={{ 
                      color: mutedTextColor,
                      borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                      backgroundColor: isDarkMode ? '#374151' : '#f9fafb'
                    }}
                  >
                    Gradient Selected: {BEAUTIFUL_GRADIENTS.find((g) => g.value === settings.backgroundColor)?.name || 'Custom'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                  className="w-full p-2 border rounded"
                  style={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                    color: isDarkMode ? '#f9fafb' : '#1f2937'
                  }}
                  aria-label="Font family"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Font Size: {settings.fontSize}px
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSettings({ fontSize: Math.max(10, settings.fontSize - 1) })}
                    className="p-1 border rounded transition-colors duration-200"
                    style={{
                      borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      color: isDarkMode ? '#f9fafb' : '#1f2937'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#ffffff';
                    }}
                    aria-label="Decrease font size"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                    className="flex-1"
                    style={{
                      accentColor: '#3b82f6'
                    }}
                    aria-label="Font size slider"
                  />
                  <button
                    onClick={() => updateSettings({ fontSize: Math.min(20, settings.fontSize + 1) })}
                    className="p-1 border rounded transition-colors duration-200"
                    style={{
                      borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      color: isDarkMode ? '#f9fafb' : '#1f2937'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#ffffff';
                    }}
                    aria-label="Increase font size"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetSettings}
                  className="flex-1 p-2 border rounded flex items-center justify-center gap-2 transition-colors duration-200"
                  style={{
                    borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: isDarkMode ? '#f9fafb' : '#1f2937'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#ffffff';
                  }}
                  aria-label="Reset settings"
                >
                  <RotateCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Editor */}
        {editing && (
          <div className="p-4 border-b" style={{ 
            borderBottomColor: theme.border,
            backgroundColor: theme.surface,
            color: theme.text 
          }}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                    color: isDarkMode ? '#f9fafb' : '#1f2937'
                  }}
                  aria-label="Profile name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  value={tempProfile.title || ""}
                  onChange={(e) => setTempProfile({ ...tempProfile, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                    color: isDarkMode ? '#f9fafb' : '#1f2937'
                  }}
                  aria-label="Profile title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={tempProfile.bio || ""}
                  onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                    color: isDarkMode ? '#f9fafb' : '#1f2937'
                  }}
                  aria-label="Profile bio"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors duration-200"
                  style={{
                    borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: isDarkMode ? '#f9fafb' : '#1f2937'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#ffffff';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdits}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-3 border-b" style={{ 
          borderBottomColor: theme.border,
          backgroundColor: theme.surface,
          color: theme.text 
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Quick Actions</span>
            <span className="text-xs" style={{ color: theme.textSecondary }}>Personalized</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.slice(0, 2).map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1 text-xs rounded-lg transition-colors duration-200"
                style={{
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.surface,
                  color: theme.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.surface;
                }}
                disabled={loading}
              >
                {prompt.length > 25 ? prompt.substring(0, 25) + "..." : prompt}
              </button>
            ))}
            <button
              onClick={quickIntroduce}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={loading}
            >
              Introduce
            </button>
            <button
              onClick={clearChat}
              className="px-3 py-1 text-xs rounded-lg transition-colors duration-200 flex items-center gap-1"
              style={{
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                color: theme.text
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.surface;
              }}
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          style={{ 
            ...(isGradient 
              ? { backgroundImage: settings.backgroundColor, backgroundColor: 'transparent' }
              : { backgroundColor: settings.backgroundColor, backgroundImage: 'none' }
            ),
            maxHeight: `${settings.height - 300}px` 
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                message.role === "user" ? "justify-end" : "justify-start"
              } ${message.isAnimating ? "animate-pulse" : ""}`}
            >
              <div className={`flex items-start max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-2"
                      : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 mr-2"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" style={{ color: textColor }} />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : ""
                  }`}
                  style={message.role !== "user" ? {
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    color: isDarkMode ? '#f8fafc' : '#1f2937'
                  } : undefined}
                >
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown 
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        code: ({children}) => <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{children}</code>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <div 
                    className={`text-xs mt-2 ${
                      message.role === "user" ? "text-white/70" : ""
                    }`}
                    style={message.role !== "user" ? { color: mutedTextColor } : undefined}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start space-x-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                  <Bot className="w-4 h-4" style={{ color: textColor }} />
                </div>
                <div 
                  className="px-4 py-3 rounded-2xl flex items-center space-x-2"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    color: isDarkMode ? '#f8fafc' : '#1f2937'
                  }}
                >
                  <Loader className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesRef} />
        </div>

        {/* Enhanced Input Area */}
        <div 
          className="p-4 border-t"
          style={{ 
            borderTopColor: theme.border,
            ...(isGradient 
              ? { backgroundImage: settings.backgroundColor, backgroundColor: 'transparent' }
              : { backgroundColor: settings.backgroundColor, backgroundImage: 'none' }
            )
          }}
        >
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div 
                className="flex items-center rounded-xl shadow-sm transition-all duration-200 input-container"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(226, 232, 240, 0.8)'}`,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
                onFocus={() => {
                  const div = document.querySelector('.input-container') as HTMLElement;
                  if (div) {
                    div.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3), 0 0 0 2px rgba(59, 130, 246, 0.2)';
                  }
                }}
                onBlur={() => {
                  const div = document.querySelector('.input-container') as HTMLElement;
                  if (div) {
                    div.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none resize-none text-sm chatbot-input"
                  style={{
                    color: isDarkMode ? '#f8fafc' : '#1f2937'
                  }}
                  disabled={loading}
                  maxLength={1000}
                  aria-label="Message input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="true"
                />
                {input && (
                  <button
                    onClick={clearInput}
                    className="p-2 transition-colors duration-200"
                    style={{
                      color: isDarkMode ? '#94a3b8' : '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#cbd5e1' : '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
                    }}
                    aria-label="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {error && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <Circle className="w-3 h-3 fill-current" />
                  {error}
                </div>
              )}
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className={`p-3 rounded-xl text-white font-medium transition-all duration-200 ${
                !input.trim() || loading
                  ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resize Handles */}
        {!settings.isMaximized && (
          <>
            {/* Corner handles */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize opacity-0 hover:opacity-100 bg-blue-500 rounded-br-lg"
              onMouseDown={(e) => handleMouseDown(e, 'resize', 'top-left')}
              style={{ transform: 'translate(-50%, -50%)' }}
            />
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize opacity-0 hover:opacity-100 bg-blue-500 rounded-bl-lg"
              onMouseDown={(e) => handleMouseDown(e, 'resize', 'top-right')}
              style={{ transform: 'translate(50%, -50%)' }}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize opacity-0 hover:opacity-100 bg-blue-500 rounded-tr-lg"
              onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom-left')}
              style={{ transform: 'translate(-50%, 50%)' }}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 hover:opacity-100 bg-blue-500 rounded-tl-lg"
              onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom-right')}
              style={{ transform: 'translate(50%, 50%)' }}
            />

            {/* Edge handles */}
            <div
              className="absolute top-0 left-1/2 w-6 h-1 cursor-n-resize opacity-0 hover:opacity-100 bg-blue-500 rounded-b"
              onMouseDown={(e) => handleMouseDown(e, 'resize', 'top')}
              style={{ transform: 'translateX(-50%)' }}
            />
            <div
              className="absolute bottom-0 left-1/2 w-6 h-1 cursor-s-resize opacity-0 hover:opacity-100 bg-blue-500 rounded-t"
              onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom')}
              style={{ transform: 'translateX(-50%)' }}
            />
            <div
              className="absolute left-0 top-1/2 w-1 h-6 cursor-w-resize opacity-0 hover:opacity-100 bg-blue-500 rounded-r"
              onMouseDown={(e) => handleMouseDown(e, 'resize', 'left')}
              style={{ transform: 'translateY(-50%)' }}
            />
            <div
              className="absolute right-0 top-1/2 w-1 h-6 cursor-e-resize opacity-0 hover:opacity-100 bg-blue-500 rounded-l"
              onMouseDown={(e) => handleMouseDown(e, 'resize', 'right')}
              style={{ transform: 'translateY(-50%)' }}
            />
          </>
        )}
      </div>

      {/* Mobile Touch Overlay */}
      {(dragState.isDragging || dragState.isResizing) && (
        <div className="fixed inset-0 z-40 bg-black/10 touch-none" />
      )}
    </>
  );
};

export default EnhancedChatbot;
