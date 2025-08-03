// client/src/pages/RegisterPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const passwordStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabel = (score: number) => {
  switch (score) {
    case 0:
    case 1:
      return { text: "Very weak", color: "bg-red-500" };
    case 2:
      return { text: "Weak", color: "bg-orange-500" };
    case 3:
      return { text: "Fair", color: "bg-amber-500" };
    case 4:
      return { text: "Strong", color: "bg-emerald-500" };
    case 5:
      return { text: "Very strong", color: "bg-green-600" };
    default:
      return { text: "Weak", color: "bg-orange-500" };
  }
};

const RegisterPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  // Destructure the optional register method
  const signup = auth.register;

  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => localStorage.getItem("lastEmail") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const score = useMemo(() => passwordStrength(password), [password]);
  const sLabel = strengthLabel(score);

  useEffect(() => {
    setError("");
  }, [name, email, password, confirm, agree]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Ensure the register function exists
    if (typeof signup !== "function") {
      console.error("AuthContext.register is not defined");
      setError("Registration is not available right now.");
      return;
    }

    // Client-side validation
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      // Call the guaranteed function
      await signup(email.trim(), password, name.trim());
      localStorage.setItem("lastEmail", email.trim());
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-950"
    >
      <Container className="flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center dark:border-slate-800">
            <motion.h1
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="text-3xl font-extrabold text-white"
            >
              Create your account
            </motion.h1>
            <p className="mt-1 text-sm text-indigo-100">
              Join to manage content and services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6" noValidate>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-9 pr-3 outline-none ring-blue-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Alex Johnson"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-9 pr-3 outline-none ring-blue-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
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
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-9 pr-10 outline-none ring-blue-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="At least 8 characters"
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
              {/* Strength meter */}
              <div className="mt-2">
                <div className="flex h-2 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={[
                        "mr-1 flex-1 last:mr-0 transition-colors",
                        i < score
                          ? sLabel.color
                          : "bg-slate-300 dark:bg-slate-700",
                      ].join(" ")}
                    />
                  ))}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {password
                    ? sLabel.text
                    : "Use 8+ chars, mix letters, numbers, symbols."}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-9 pr-10 outline-none ring-blue-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={
                    showConfirm
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirm && confirm !== password && (
                <div className="mt-1 text-xs text-red-600">
                  Passwords do not match.
                </div>
              )}
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start gap-2">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
              />
              <label
                htmlFor="agree"
                className="text-sm text-slate-700 dark:text-slate-300"
              >
                I agree to the{" "}
                <Link to="/terms" className="text-indigo-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </Container>
    </motion.div>
  );
};

export default RegisterPage;