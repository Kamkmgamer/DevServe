import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import api from "../api/axios";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );

  // Sync axios header with token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Initialize header from stored token at mount
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored && !api.defaults.headers.common["Authorization"]) {
      api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>("/auth/login", {
      email,
      password,
    });
    setToken(data.token);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const { data } = await api.post<{ token: string }>("/auth/register", {
        email,
        password,
        name,
      });
      // Set the token immediately after registration
      setToken(data.token);
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};