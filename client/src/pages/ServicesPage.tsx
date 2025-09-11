import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Container from "../components/layout/Container";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search, Tag } from "lucide-react";

// Types
type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  features?: string; // JSON string or comma list
  imageUrls?: string; // JSON string or comma list
  thumbnailUrl?: string;
};

// Utils
const formatPrice = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

const safeParse = (value?: string) => {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fallback: comma separated
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [] as string[];
};

// Small hooks
function useDebouncedValue<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// Components
const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-3 h-40 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
    <div className="h-4 w-3/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    <div className="mt-2 flex items-center justify-between">
      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
);

const CategoryPill: React.FC<{
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
}> = ({ name, count, active, onClick }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
      ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"}`}
  >
    <Tag className="h-4 w-4" />
    <span className="truncate">{name}</span>
    <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>
      {count}
    </span>
  </button>
);

const PreviewImage: React.FC<{ service: Service }> = ({ service }) => {
  const imgs = useMemo(() => {
    if (service.thumbnailUrl) return [service.thumbnailUrl];
    return safeParse(service.imageUrls).slice(0, 1);
  }, [service.thumbnailUrl, service.imageUrls]);

  const src = imgs[0];
  return (
    <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
      {src ? (
        <img
          src={src}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image</div>
      )}
    </div>
  );
};

// Animation variants
const listVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, y: 12, scale: 0.995, transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] } },
};

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
  <motion.div
    layout
    variants={itemVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
  >
    <Link to={`/services/${service.id}`} className="block">
      <motion.div layoutId={`service-image-${service.id}`}>
        <PreviewImage service={service} />
      </motion.div>

      <div className="p-5">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{service.category}</div>
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-slate-900 dark:text-white">{service.name}</h3>
        <p className="mb-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-white">{formatPrice(service.price)}</span>
          <span className="text-sm text-blue-600 group-hover:underline">View details {"→"}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// Main page
const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 220);

  // fetch with cancellation
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api
      .get<Service[]>("/services", { signal: controller.signal })
      .then((res) => {
        if (cancelled) return;
        setServices(res.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.name === "CanceledError" || err?.message === "canceled") return;
        setError(err?.response?.data?.error || err.message || "Failed to load services.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // categories with counts
  const categories = useMemo(() => {
    const base = new Map<string, number>();
    services.forEach((s) => base.set(s.category, (base.get(s.category) || 0) + 1));
    return [
      { name: "All", count: services.length },
      ...Array.from(base.entries()).map(([name, count]) => ({ name, count })),
    ];
  }, [services]);

  const filtered = useMemo(() => {
    const byCat = activeCategory === "All" ? services : services.filter((s) => s.category === activeCategory);
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter((s) => {
      return [s.name, s.description, s.category].some((t) => t?.toLowerCase().includes(q));
    });
  }, [services, activeCategory, debouncedQuery]);

  const onClear = useCallback(() => setQuery(""), []);

  if (loading) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">Fetching services, hang tight.</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20 text-center">
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-red-600">Error loading services</motion.h2>
        <p className="mt-2 text-gray-500">{error}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => window.location.reload()} className="rounded-md bg-blue-600 px-4 py-2 text-white">Retry</button>
          <Link to="/contact" className="text-sm text-blue-600 underline">Contact support</Link>
        </div>
      </Container>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900/40">
        <Container className="py-12 md:py-16">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Services</h1>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Explore offerings tailored to performance, accessibility, and conversion.</p>
          </div>

          <div className="mb-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <CategoryPill key={c.name} name={c.name} count={c.count} active={activeCategory === c.name} onClick={() => setActiveCategory(c.name)} />
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <label htmlFor="service-search" className="sr-only">Search services</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="service-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900"
              />

              {query && (
                <button onClick={onClear} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Clear
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-300">No services found. Try a different category or search term.</p>
              <Link to="/contact" className="mt-4 inline-block">
                <span className="text-blue-600 hover:underline">Need something custom?</span>
              </Link>
            </div>
          ) : (
            <motion.div layout variants={listVariants} initial={false} animate="animate">
              <AnimatePresence mode="sync" initial={false}>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
              </AnimatePresence>
            </motion.div>
          )}
        </Container>
      </div>
    </motion.div>
  );
};

export default ServicesPage;
