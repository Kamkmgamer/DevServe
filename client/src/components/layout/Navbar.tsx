import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Code,
  Menu,
  X,
  ShoppingCart,
  UserCircle,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import Container from "./Container";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    setIsOpen(false);
    navigate("/");
  };

  const navLinks = [
    { href: "/", label: "Home", isNavLink: true },
    { href: "/services", label: "Services", isNavLink: true },
    {
      href: "https://portfolio-delta-ruby-48.vercel.app/",
      label: "Portfolio",
      isExternal: true,
    },
    { href: "/pricing", label: "Pricing", isNavLink: true },
    { href: "/blog", label: "Blog", isNavLink: true },
    { href: "/contact", label: "Contact", isNavLink: true },
  ];

  const renderLink = (link: typeof navLinks[0], isMobile = false) => {
    const linkClasses = `py-2 px-3 rounded-lg font-medium transition-colors ${
      isMobile ? "text-xl" : "text-lg"
    }`;
    const activeClasses =
      "text-blue-600 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-slate-800/60";
    const inactiveClasses =
      "text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400";

    if ((link as any).isExternal) {
      return (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClasses} ${inactiveClasses}`}
          onClick={() => setIsOpen(false)}
        >
          {link.label}
        </a>
      );
    }
    return (
      <NavLink
        key={link.href}
        to={link.href}
        className={({ isActive }) =>
          `${linkClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
        onClick={() => setIsOpen(false)}
      >
        {link.label}
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Container className="flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex flex-shrink-0 items-center gap-2">
          <Code className="h-7 w-7 text-blue-600" />
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            DevServe
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-8 hidden flex-grow justify-center gap-2 lg:gap-4 md:flex">
          {navLinks.map((link) => renderLink(link))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-2 md:ml-0">
          <Link
            to="/cart"
            className="relative rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut className="h-6 w-6" />
              <span className="hidden lg:inline">Logout</span>
            </motion.button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <UserCircle className="h-6 w-6" />
              <span className="hidden lg:inline">Login</span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-6 w-6 text-yellow-500" />
            ) : (
              <Moon className="h-6 w-6 text-slate-700" />
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-16 z-40 w-full bg-white p-6 shadow-md dark:bg-slate-900 md:hidden"
            >
              <div className="flex flex-col items-center gap-6">
                {navLinks.map((link) => renderLink(link, true))}
                <div className="mt-4 flex flex-col items-center gap-4">
                  {isAuthenticated ? (
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-2xl font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                    >
                      <LogOut className="h-8 w-8" />
                      Logout
                    </motion.button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-2xl font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                    >
                      <UserCircle className="h-8 w-8" />
                      Login
                    </Link>
                  )}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 text-2xl font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <Moon className="h-8 w-8 text-slate-700" />
                    )}
                    Toggle Theme
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
};

export default Navbar;