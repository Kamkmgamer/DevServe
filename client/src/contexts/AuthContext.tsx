import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import api from "../api/axios";
import { User } from "../types"; // Import User type

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Regex for strong password: at least one uppercase, one lowercase, one number, one special character, min 8 chars
  const strongPasswordRegex = useMemo(() => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\\]{};':"\\|,.<>/?]).{8,}$/, []);

  // Initialize session from refresh endpoint (cookies)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await api.post<{ user: User }>("/auth/refresh");
        if (isMounted) setUser(data.user);
      } catch {
        // Not authenticated; ignore
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Centralized logout listener (triggered by axios interceptor)
  useEffect(() => {
    const handler = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ user: User }>("/auth/login", { email, password });
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      if (!strongPasswordRegex.test(password)) {
        throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      }
      const { data } = await api.post<{ user: User }>("/auth/register", { email, password, name });
      setUser(data.user);
    },
    [strongPasswordRegex]
  );

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch {}
    setUser(null);
  }, []);

  const value: AuthContextType = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    login,
    register,
    logout,
  }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};