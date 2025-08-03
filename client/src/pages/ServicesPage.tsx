import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Container from "../components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Tag } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  thumbnailUrl?: string;
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get<Service[]>("/services")
      .then((res) => setServices(res.data))
      .catch((err) =>
        setError(err?.response?.data?.error || err.message || "Failed to load services.")
      )
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const base = new Map<string, number>();
    services.forEach((s) => base.set(s.category, (base.get(s.category) || 0) + 1));
    return ["All", ...Array.from(base.keys())].map((c) => ({
      name: c,
      count: c === "All" ? services.length : base.get(c) || 0,
    }));
  }, [services]);

  const filtered = useMemo(() => {
    const byCat =
      activeCategory === "All"
        ? services
        : services.filter((s) => s.category === activeCategory);
    if (!query.trim()) return byCat;
    const q = query.toLowerCase();
    return byCat.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [services, activeCategory, query]);

  if (loading)
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xl text-gray-700 dark:text-gray-200">Loading services…</p>
      </Container>
    );

  if (error)
    return (
      <Container className="py-20 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-red-600"
        >
          Error loading services
        </motion.h2>
        <p className="mt-2 text-gray-500">{error}</p>
      </Container>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900/40">
        <Container className="py-12 md:py-16">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              Services
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Explore offerings tailored to performance, accessibility, and conversion.
            </p>
          </div>

          {/* Top controls */}
          <div className="mb-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    <Tag className="h-4 w-4" />
                    {cat.name}
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs",
                        active ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800",
                      ].join(" ")}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services…"
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-300">
                No services found. Try a different category or search term.
              </p>
              <Link to="/contact" className="mt-4 inline-block">
                <span className="text-blue-600 hover:underline">Need something custom?</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filtered.map((s, i) => (
                  <motion.div
                    key={s.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/services/${s.id}`} className="block">
                      {s.thumbnailUrl && (
                        <motion.div
                          layoutId={`service-image-${s.id}`}
                          className="relative h-44 w-full overflow-hidden"
                        >
                          <img
                            src={s.thumbnailUrl}
                            alt={s.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        </motion.div>
                      )}
                      <div className="p-5">
                        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {s.category}
                        </div>
                        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-slate-900 dark:text-white">
                          {s.name}
                        </h3>
                        <p className="mb-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                          {s.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            {formatPrice(s.price)}
                          </span>
                          <span className="text-sm text-blue-600 group-hover:underline">
                            View details →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Container>
      </div>
    </motion.div>
  );
};

export default ServicesPage;