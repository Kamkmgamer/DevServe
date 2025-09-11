import { useEffect, useMemo, useState } from "react";
import Container from "../../components/layout/Container";
import api from "../../api/axios";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Users,
  ShoppingCart,
  Package,
  Layers,
  AlertTriangle,
} from "lucide-react";

type DashboardData = {
  userCount: number;
  serviceCount: number;
  orderCount: number;
  cartItemCount: number;
};

const AdminPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get<DashboardData>("/admin");
      setData(res.data);
      setUpdatedAt(new Date());
    } catch (err: { response?: { data?: { error?: string } }; message?: string }) {
      setError(err?.response?.data?.error || err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Optionally auto-refresh every 60s:
    // const t = setInterval(fetchData, 60000);
    // return () => clearInterval(t);
  }, []);

  const items = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Users",
        value: data.userCount ?? 0,
        icon: Users,
        color: "text-purple-600",
        chip: "All time",
      },
      {
        label: "Services",
        value: data.serviceCount ?? 0,
        icon: Layers,
        color: "text-blue-600",
        chip: "Active",
      },
      {
        label: "Orders",
        value: data.orderCount ?? 0,
        icon: Package,
        color: "text-emerald-600",
        chip: "All time",
      },
      {
        label: "Cart Items",
        value: data.cartItemCount ?? 0,
        icon: ShoppingCart,
        color: "text-amber-600",
        chip: "Current",
      },
    ];
  }, [data]);

  const Header = (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Admin Dashboard
      </h1>
      <div className="flex items-center gap-3">
        {updatedAt && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Last updated: {updatedAt.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          aria-label="Refresh dashboard"
        >
          <RefreshCw size={18} className="aria-busy:animate-spin" />
          Refresh
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Container className="py-12">
        {Header}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-16">
        {Header}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
          role="alert"
        >
          <div className="mb-2 flex items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            Failed to load dashboard
          </div>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </motion.div>
      </Container>
    );
  }

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
    chip,
    i,
  }: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    chip: string;
    i: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900"
      role="region"
      aria-label={label}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-full border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <Icon className={`h-7 w-7 ${color}`} />
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {chip}
        </span>
      </div>
      <div className="text-4xl font-bold text-slate-900 dark:text-white">
        {value.toLocaleString()}
      </div>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </p>
    </motion.div>
  );

  const isEmpty =
    !items.length ||
    items.every((it) => (it.value ?? 0) === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Container className="py-12">
        {Header}

        {isEmpty ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-300">
              No data yet. Once users interact with your app, stats will appear
              here.
            </p>
            <button
              onClick={fetchData}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              <RefreshCw size={16} />
              Refresh now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((c, i) => (
              <StatCard key={c.label} {...c} i={i} />
            ))}
          </div>
        )}
      </Container>
    </motion.div>
  );
};

export default AdminPage;