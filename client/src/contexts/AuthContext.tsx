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
import { jwtDecode } from "jwt-decode"; // Corrected import
import { User } from "../types"; // Import User type

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null; // Add user object to context
  login: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null); // New state for user object

  // Function to decode token and set user
  const decodeAndSetUser = useCallback((token: string | null) => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Assuming your token payload has id, email, name, role
        setUser({
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          createdAt: decoded.createdAt, // Assuming these are in token
          updatedAt: decoded.updatedAt, // Assuming these are in token
        });
      } catch (error) {
        console.error("Failed to decode token:", error);
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
      }
    } else {
      setUser(null);
    }
  }, []);

  // Sync axios header with token and decode user
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
      decodeAndSetUser(token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token, decodeAndSetUser]);

  // Initialize header and user from stored token at mount
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      if (!api.defaults.headers.common["Authorization"]) {
        api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
      }
      decodeAndSetUser(stored);
    }
  }, [decodeAndSetUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>("/auth/login", {
      email,
      password,
    });
    setToken(data.token);
  }, []);

  // Regex for strong password: at least one uppercase, one lowercase, one number, one special character, min 8 chars
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      if (!strongPasswordRegex.test(password)) {
        throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      }
      const { data } = await api.post<{ token: string }>("/auth/register", {
        email,
        password,
        name,
      });
      setToken(data.token);
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null); // Clear user on logout
  }, []);

  const value: AuthContextType = useMemo(() => ({
    token,
    isAuthenticated: !!token,
    user, // Provide user object
    login,
    register,
    logout,
  }), [token, user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};