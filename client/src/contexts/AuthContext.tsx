// client/src/contexts/AuthContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import api from "../api/axios";

type User = {
  id: string;
  name: string;
  email: string;
  // add any other fields you return from /auth/me
};

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  // Sync axios Authorization header on mount and when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  // Initialize header immediately from stored token (covers SSR/hydration gaps)
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored && !api.defaults.headers.common["Authorization"]) {
      api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
    }
  }, []);

  // Optionally fetch current user if token exists
  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch (e) {
      // If token invalid/expired, force logout
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshUser().catch(() => {
        // handled above
      });
    } else {
      setLoading(false);
    }
  }, [token, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post<{ token: string }>("/auth/login", {
        email,
        password,
      });
      setToken(response.data.token);
      // user will be fetched by refreshUser via the effect
    } catch (err: any) {
      // rethrow to let the caller show a toast/message
      throw err;
    }
  }, []);

  // Optional: Register method for your RegisterPage
  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const response = await api.post<{ token: string }>("/auth/register", {
          email,
          password,
          name,
        });
        setToken(response.data.token);
        // user will be fetched by refreshUser via the effect
      } catch (err: any) {
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};