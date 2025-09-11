// client/src/pages/LoginPage.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, Lock, Mail } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState(
    () => localStorage.getItem("lastEmail") || ""
  );
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      if (remember) localStorage.setItem("lastEmail", email.trim());
      else localStorage.removeItem("lastEmail");
      navigate("/");
    } catch (err: { response?: { data?: { error?: string } } }) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-950"
    >
      <Container className="p-8 max-w-md w-full bg-white rounded-2xl shadow-2xl dark:bg-slate-900">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-purple-600 mb-6"
        >
          Admin Login
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative"
          >
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 pl-11 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 dark:bg-slate-800 dark:border-slate-700"
                placeholder="you@example.com"
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative"
          >
            <label
              htmlFor="password"
              className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pl-11 pr-11 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 dark:bg-slate-800 dark:border-slate-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showPwd ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Remember + Back Home */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm dark:text-gray-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-slate-600"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-purple-600 hover:underline dark:text-purple-400"
            >
              Forgot password?
            </Link>
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Back to Home
            </Link>
          </div>


          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg rounded-lg bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-all duration-300"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mx-auto text-white" />
              ) : (
                "Login"
              )}
            </Button>
          </motion.div>

          {/* Register Link */}
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-purple-600 hover:underline dark:text-purple-400"
            >
              Register
            </Link>
          </div>
        </form>
      </Container>
    </motion.div>
  );
};

export default LoginPage;