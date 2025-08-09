// client/src/pages/admin/AdminCouponsPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Trash2,
  Pencil,
  Copy,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number; // percentage OR cents
  minOrderAmount: number | null; // cents
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

type SortKey =
  | "code"
  | "type"
  | "value"
  | "minOrderAmount"
  | "uses"
  | "status"
  | "expiresAt"
  | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "percentage" | "fixed">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">(
    "all"
  );

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [page, setPage] = useState(1);

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Optimistic delete + undo
  const undoTimer = useRef<number | null>(null);
  const lastDeletedRef = useRef<Coupon | null>(null);

  const navigate = useNavigate();

  const formatCurrency = (cents: number | null) =>
    cents == null ? "-" : `$${(cents / 100).toFixed(2)}`;

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "Never";

  const getStatus = (active: boolean, expiresAt: string | null) => {
    const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
    if (!active) return "Inactive";
    if (expired) return "Expired";
    return "Active";
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/30";
      case "Inactive":
        return "text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-700/50";
      case "Expired":
        return "text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30";
      default:
        return "text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-700/50";
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Coupon[] } | Coupon[]>("/coupons");
      const list = Array.isArray(res.data) ? res.data : res.data.data;
      setCoupons(list);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Could not load coupons";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCoupons();
  }, []);

  // Derived data
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coupons.filter((c) => {
      const matchesQuery =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const status = getStatus(c.active, c.expiresAt).toLowerCase(); // active/inactive/expired
      const matchesType = typeFilter === "all" ? true : c.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" ? true : status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [coupons, query, typeFilter, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "code") cmp = a.code.localeCompare(b.code);
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
      else if (sortKey === "value") {
        // Normalize for mixed type: percentage vs cents
        const va = a.type === "percentage" ? a.value : a.value / 100;
        const vb = b.type === "percentage" ? b.value : b.value / 100;
        cmp = va - vb;
      } else if (sortKey === "minOrderAmount") {
        const va = a.minOrderAmount ?? Number.POSITIVE_INFINITY;
        const vb = b.minOrderAmount ?? Number.POSITIVE_INFINITY;
        cmp = va - vb;
      } else if (sortKey === "uses") {
        const ua = a.currentUses / (a.maxUses ?? Infinity);
        const ub = b.currentUses / (b.maxUses ?? Infinity);
        cmp = ua - ub;
      } else if (sortKey === "status") {
        const sa = getStatus(a.active, a.expiresAt);
        const sb = getStatus(b.active, b.expiresAt);
        cmp = sa.localeCompare(sb);
      } else if (sortKey === "expiresAt") {
        const ta = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
        const tb = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
        cmp = ta - tb;
      } else {
        // createdAt
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [query, typeFilter, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const doDelete = async (id: string) => {
    const coup = coupons.find((c) => c.id === id);
    if (!coup) return;

    // Optimistic removal
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    lastDeletedRef.current = coup;

    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Coupon deleted.</span>
          <button
            onClick={() => {
              if (lastDeletedRef.current) {
                setCoupons((prev) => [lastDeletedRef.current!, ...prev]);
                lastDeletedRef.current = null;
              }
              toast.dismiss(t.id);
              if (undoTimer.current) {
                window.clearTimeout(undoTimer.current);
                undoTimer.current = null;
              }
            }}
            className="text-blue-600 hover:underline"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );

    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(async () => {
      const toDelete = lastDeletedRef.current;
      lastDeletedRef.current = null;
      try {
        await api.delete(`/coupons/${id}`);
        toast.success("Coupon permanently deleted");
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Delete failed";
        if (toDelete) setCoupons((prev) => [toDelete, ...prev]);
        toast.error(errorMessage);
      } finally {
        undoTimer.current = null;
      }
    }, 5000);
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(code);
      toast.success("Coupon code copied!");
      setTimeout(() => setCopySuccess(null), 1500);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Container className="py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Coupons
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Search, filter, and manage discount codes.
            </p>
          </div>
          <Button
            onClick={() => navigate("/admin/coupons/new")}
            variant="primary"
          >
            Add Coupon
          </Button>
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by code or ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72 rounded-md border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                           dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "all" | "percentage" | "fixed")
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="all">All types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "active" | "inactive" | "expired"
                )
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Sort by
            </span>
            <Button
              variant="ghost"
              className={`h-9 px-3 text-sm ${
                sortKey === "createdAt" ? "text-blue-600 dark:text-blue-400" : ""
              }`}
              onClick={() => toggleSort("createdAt")}
              aria-pressed={sortKey === "createdAt"}
            >
              Created
            </Button>
            <Button
              variant="ghost"
              className={`h-9 px-3 text-sm ${
                sortKey === "code" ? "text-blue-600 dark:text-blue-400" : ""
              }`}
              onClick={() => toggleSort("code")}
              aria-pressed={sortKey === "code"}
            >
              Code
            </Button>
            <Button
              variant="ghost"
              className={`h-9 px-3 text-sm ${
                sortKey === "expiresAt" ? "text-blue-600 dark:text-blue-400" : ""
              }`}
              onClick={() => toggleSort("expiresAt")}
              aria-pressed={sortKey === "expiresAt"}
            >
              Expires
            </Button>
            {sortDir === "asc" ? (
              <SortAsc className="h-4 w-4 text-gray-500" />
            ) : (
              <SortDesc className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                <tr>
                  <Th
                    label="Code"
                    active={sortKey === "code"}
                    dir={sortDir}
                    onClick={() => toggleSort("code")}
                  />
                  <Th
                    label="Type"
                    active={sortKey === "type"}
                    dir={sortDir}
                    onClick={() => toggleSort("type")}
                  />
                  <Th
                    label="Value"
                    active={sortKey === "value"}
                    dir={sortDir}
                    onClick={() => toggleSort("value")}
                  />
                  <Th
                    label="Min Order"
                    active={sortKey === "minOrderAmount"}
                    dir={sortDir}
                    onClick={() => toggleSort("minOrderAmount")}
                  />
                  <Th
                    label="Uses"
                    active={sortKey === "uses"}
                    dir={sortDir}
                    onClick={() => toggleSort("uses")}
                  />
                  <Th
                    label="Status"
                    active={sortKey === "status"}
                    dir={sortDir}
                    onClick={() => toggleSort("status")}
                  />
                  <Th
                    label="Expires"
                    active={sortKey === "expiresAt"}
                    dir={sortDir}
                    onClick={() => toggleSort("expiresAt")}
                  />
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading && (
                  <tr>
                    <td colSpan={8} className="p-10">
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading coupons…
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={8} className="p-10">
                      <div className="text-center text-sm text-red-600 dark:text-red-400">
                        {error}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && paged.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10">
                      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        No coupons found. Try adjusting filters or create a new
                        one.
                      </div>
                    </td>
                  </tr>
                )}

                <AnimatePresence initial={false}>
                  {!loading &&
                    !error &&
                    paged.map((c, idx) => {
                      const status = getStatus(c.active, c.expiresAt);
                      return (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-3 font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <span>{c.code}</span>
                              <button
                                title="Copy code"
                                onClick={() => copyToClipboard(c.code)}
                                className={`text-gray-400 transition-colors hover:text-gray-600 ${
                                  copySuccess === c.code ? "text-green-600" : ""
                                }`}
                                aria-label={`Copy code ${c.code}`}
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3 capitalize text-sm">
                            {c.type}
                          </td>

                          <td className="px-4 py-3 text-sm font-medium">
                            {c.type === "percentage"
                              ? `${c.value}%`
                              : formatCurrency(c.value)}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(c.minOrderAmount)}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            {c.currentUses} / {c.maxUses ?? "∞"}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-sm">
                            {formatDate(c.expiresAt)}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                className="flex items-center gap-1 text-sm"
                                variant="secondary"
                                onClick={() =>
                                  navigate(`/admin/coupons/${c.id}/edit`)
                                }
                                aria-label={`Edit ${c.code}`}
                              >
                                <Pencil size={16} />
                                Edit
                              </Button>
                              <Button
                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                                variant="ghost"
                                onClick={() => doDelete(c.id)}
                                aria-label={`Delete ${c.code}`}
                              >
                                <Trash2 size={16} />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm dark:border-gray-700">
              <div className="text-gray-600 dark:text-gray-400">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe === 1}
                >
                  Previous
                </Button>
                <span className="text-gray-600 dark:text-gray-400">
                  Page {pageSafe} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </motion.div>
  );
};

function Th({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          active ? "text-blue-600 dark:text-blue-400" : ""
        }`}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )
        ) : (
          <span className="ml-4" />
        )}
        <span className="sr-only">
          Sort {active ? (dir === "asc" ? "descending" : "ascending") : ""}
        </span>
      </button>
    </th>
  );
}

export default AdminCouponsPage;