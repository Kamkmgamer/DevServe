import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Tags,
  FileText,
  Package,
  TicketPercent,
  Menu,
  X,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type LinkItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const links: LinkItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/services", label: "Services", icon: Package },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/orders", label: "Orders", icon: Tags },
];

export const AdminNavbar = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  // Optionally support Cmd/Ctrl+K to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const metaK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (metaK) {
        e.preventDefault();
        const el = document.getElementById("admin-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return links;
    return links.filter(
      (l) => l.label.toLowerCase().includes(term) || l.to.toLowerCase().includes(term),
    );
  }, [q]);

  const Item = ({ to, label, icon: Icon }: LinkItem) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        ].join(" ")
      }
      end={to === "/admin"}
      onClick={() => setOpen(false)}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {/* Active indicator pill */}
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-lg ring-1 ring-black/5 dark:ring-white/10" />
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-gray-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/admin" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            Admin
          </span>
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800">
            Internal
          </span>
        </Link>

        {/* Search */}
        <div className="relative ml-3 hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections…  (Ctrl/⌘K)"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          {/* Quick suggestions dropdown */}
          {q && (
            <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                  No matches
                </div>
              ) : (
                filtered.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setQ("")}
                  >
                    <l.icon className="h-4 w-4 text-slate-400" />
                    {l.label}
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Desktop links */}
        <nav className="ml-auto hidden gap-2 md:flex">
          {links.map((l) => (
            <Item key={l.to} {...l} />
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open admin menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {/* mobile search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                {(q ? filtered : links).map((l) => (
                  <Item key={l.to} {...l} />
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};