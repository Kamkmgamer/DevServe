import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    setIsOpen(false);
    navigate("/");
  };

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home", isNavLink: true },
      { href: "/services", label: "Services", isNavLink: true },
      {
        href: import.meta.env.VITE_PORTFOLIO_URL,
        label: "Portfolio",
        isExternal: true,
      },
      { href: "/pricing", label: "Pricing", isNavLink: true },
      { href: "/blog", label: "Blog", isNavLink: true },
      { href: "/contact", label: "Contact", isNavLink: true },
    ],
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!isOpen) return;
      const target = e.target as Node;
      if (
        mobilePanelRef.current &&
        !mobilePanelRef.current.contains(target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  const renderLink = (
    link: (typeof navLinks)[number],
    opts?: { isMobile?: boolean; onClick?: () => void }
  ) => {
    const isMobile = opts?.isMobile ?? false;
    const onClick = opts?.onClick ?? (() => setIsOpen(false));

    const base =
      "py-0 px-4 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60";
    const size = isMobile ? "text-xl" : "text-sm";
    const inactive =
      "text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400";
    const active =
      "text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-slate-800/70";

    const uniqueKey = link.href || `link-${link.label}`;

    if (link.isExternal) {
      return (
        <a
          key={uniqueKey}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} ${size} ${inactive}`}
          onClick={onClick}
        >
          {link.label}
        </a>
      );
    }

    return (
      <NavLink
        key={uniqueKey}
        to={link.href}
        className={({ isActive }) =>
          `${base} ${size} ${isActive ? active : inactive}`
        }
        onClick={onClick}
      >
        {link.label}
      </NavLink>
    );
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70
                 border-b border-slate-200/60 dark:supports-[backdrop-filter]:bg-slate-900/60
                 dark:border-slate-800/60"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
                   focus:z-[100] rounded bg-blue-600 px-3 py-2 text-white"
      >
        Skip to content
      </a>

      <Container className="flex h-16 items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="group flex flex-shrink-0 items-center gap-2 focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-blue-500/60 rounded-md"
          aria-label="DevServe home"
        >
          <Code className="h-7 w-7 text-blue-600 transition-transform group-hover:rotate-6" />
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            DevServe
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="relative ml-6 hidden md:flex flex-1 justify-center"
          aria-label="Primary"
          role="navigation"
        >
          <div
            className="relative flex items-center gap-1 rounded-full border border-slate-200
                       bg-white/70 dark:bg-slate-900/60 dark:border-slate-800
                       px-1 py-1 shadow-sm backdrop-blur"
          >
            {navLinks.map((l) => renderLink(l))}
          </div>
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <Link
            to="/cart"
            className="relative rounded-full p-2 transition-colors hover:bg-slate-100
                       dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-blue-500/60"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            {itemCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center
                           justify-center rounded-full bg-red-500 px-1 text-xs text-white
                           shadow"
                aria-label={`${itemCount} items in cart`}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2
                         text-slate-700 transition-colors hover:bg-slate-100
                         dark:text-slate-300 dark:hover:bg-slate-800
                         focus:outline-none focus-visible:ring-2
                         focus-visible:ring-blue-500/60"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </motion.button>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2
                         text-slate-700 transition-colors hover:bg-slate-100
                         dark:text-slate-300 dark:hover:bg-slate-800
                         focus:outline-none focus-visible:ring-2
                         focus-visible:ring-blue-500/60"
            >
              <UserCircle className="h-5 w-5" />
              <span>Login</span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 transition-colors hover:bg-slate-100
                       dark:hover:bg-slate-800 focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500/60"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-6 w-6 text-amber-400" />
            ) : (
              <Moon className="h-6 w-6 text-slate-700" />
            )}
          </button>

          {/* Mobile menu button */}
          <button
            ref={menuBtnRef}
            onClick={() => setIsOpen((v) => !v)}
            className="rounded-full p-2 transition-colors hover:bg-slate-100
                       dark:hover:bg-slate-800 md:hidden focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500/60"
            aria-label="Toggle mobile menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              ref={mobilePanelRef}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 top-16 z-40 w-full md:hidden"
            >
              <div
                className="mx-3 overflow-hidden rounded-2xl border border-slate-200
                           bg-white/90 p-4 shadow-lg backdrop-blur dark:border-slate-800
                           dark:bg-slate-900/90"
              >
                {/* Focus trap sentinels */}
                <button
                  className="sr-only"
                  aria-hidden="true"
                  onFocus={() => {
                    const el =
                      mobilePanelRef.current?.querySelector<HTMLElement>(
                        "[data-first-focus]"
                      );
                    el?.focus();
                  }}
                />
                <div className="flex flex-col items-stretch gap-2">
                  {navLinks.map((link) => (
                    <motion.div
                      key={link.href || link.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {renderLink(link, {
                        isMobile: true,
                        onClick: () => setIsOpen(false),
                      })}
                    </motion.div>
                  ))}

                  <div className="my-2 h-px w-full bg-slate-200 dark:bg-slate-800" />

                  {isAuthenticated ? (
                    <motion.button
                      data-first-focus
                      onClick={handleLogout}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl
                                 bg-slate-100 px-4 py-3 text-lg font-medium text-slate-800
                                 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100
                                 dark:hover:bg-slate-700 focus:outline-none
                                 focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    >
                      <LogOut className="h-6 w-6" />
                      Logout
                    </motion.button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl
                                 bg-blue-600 px-4 py-3 text-lg font-semibold text-white
                                 hover:bg-blue-500 focus:outline-none
                                 focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    >
                      <UserCircle className="h-6 w-6" />
                      Login
                    </Link>
                  )}

                  <button
                    onClick={toggleTheme}
                    className="mt-2 flex w-full items-center justify-center gap-2
                               rounded-xl px-4 py-3 text-lg font-medium text-slate-700
                               hover:bg-slate-100 dark:text-slate-300
                               dark:hover:bg-slate-800 focus:outline-none
                               focus-visible:ring-2 focus-visible:ring-blue-500/60"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-6 w-6 text-amber-400" />
                    ) : (
                      <Moon className="h-6 w-6 text-slate-700" />
                    )}
                    Toggle theme
                  </button>
                </div>

                <button
                  className="sr-only"
                  aria-hidden="true"
                  onFocus={() => menuBtnRef.current?.focus()}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
};

export default Navbar;