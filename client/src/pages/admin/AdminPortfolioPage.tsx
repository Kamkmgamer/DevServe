// client/src/pages/admin/AdminPortfolioPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  Grid,
  List,
  Search,
  SortAsc,
  SortDesc,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

type PortfolioItem = {
  id: string;
  title: string;
  category: string; // Assuming category exists for filtering
  createdAt: string;
};

type SortKey = "title" | "category" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 12;

const AdminPortfolioPage: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const nav = useNavigate();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const applyMobileState = (matches: boolean) => {
      setIsMobile(matches);
      if (matches) {
        setViewMode("grid");
      }
    };
    applyMobileState(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      applyMobileState(e.matches);
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange);
    } else {
      mq.addListener(handleChange);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handleChange);
      } else {
        mq.removeListener(handleChange);
      }
    };
  }, []);

  const undoTimer = useRef<number | null>(null);
  const lastDeletedRef = useRef<PortfolioItem | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<PortfolioItem[]>("/portfolio");
      setItems(res.data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load portfolio items";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((s) => s.category))).sort(
      (a, b) => a.localeCompare(b)
    );
    return ["All", ...unique];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      const matchesCat =
        activeCategory === "All" ? true : s.category === activeCategory;
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [items, query, activeCategory]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "category")
        cmp = a.category.localeCompare(b.category);
      else cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first for date
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
  }, [activeCategory, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const doDelete = async (id: string) => {
    const item = items.find((s) => s.id === id);
    if (!item) return;

    setItems((prev) => prev.filter((s) => s.id !== id));
    lastDeletedRef.current = item;

    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Item deleted.</span>
          <button
            onClick={() => {
              if (lastDeletedRef.current) {
                setItems((prev) => [lastDeletedRef.current!, ...prev]);
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
        await api.delete(`/portfolio/${id}`);
        toast.success("Item permanently deleted");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Delete failed";
        if (toDelete) setItems((prev) => [toDelete, ...prev]);
        toast.error(errorMessage);
      } finally {
        undoTimer.current = null;
      }
    }, 5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="overflow-x-hidden"
    >
      <Container className="py-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Manage Portfolio
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Search, filter, sort and manage your portfolio items.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isMobile && (
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                title="Table view"
              >
                <List className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              title="Grid view"
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button as={Link} to="/admin/portfolio/new" variant="primary">
              Add Item
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by title, category, or ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72 rounded-md border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                           dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Sort by
              </span>
              <Button
                variant="ghost"
                className={`h-9 px-3 text-sm ${
                  sortKey === "title" ? "text-blue-600 dark:text-blue-400" : ""
                }`}
                onClick={() => toggleSort("title")}
                aria-pressed={sortKey === "title"}
              >
                Title
              </Button>
              <Button
                variant="ghost"
                className={`h-9 px-3 text-sm ${
                  sortKey === "category"
                    ? "text-blue-600 dark:text-blue-400"
                    : ""
                }`}
                onClick={() => toggleSort("category")}
                aria-pressed={sortKey === "category"}
              >
                Category
              </Button>
              <Button
                variant="ghost"
                className={`h-9 px-3 text-sm ${
                  sortKey === "createdAt" ? "text-blue-600 dark:text-blue-400" : ""
                }`}
                onClick={() => toggleSort("createdAt")}
                aria-pressed={sortKey === "createdAt"}
              >
                Date
              </Button>
              {sortDir === "asc" ? (
                <SortAsc className="h-4 w-4 text-gray-500" />
              ) : (
                <SortDesc className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
          {loading && (
            <div className="flex items-center justify-center p-10 text-gray-600 dark:text-gray-300">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading items…
            </div>
          )}

          {!loading && error && (
            <div className="p-10 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-600 dark:text-gray-400">
              No items found. Try adjusting filters or add a new one.
            </div>
          )}

          {!loading && !error && sorted.length > 0 && (
            <>
              {viewMode === "table" && !isMobile ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Category
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Created
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                      <AnimatePresence initial={false}>
                        {paged.map((s, idx) => (
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              <button
                                className="text-left hover:underline"
                                onClick={() =>
                                  nav(`/admin/portfolio/${s.id}/edit`)
                                }
                              >
                                {s.title}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {s.category}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {new Date(s.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  className="flex items-center gap-1 px-2 py-1 text-sm"
                                  onClick={() =>
                                    nav(`/admin/portfolio/${s.id}/edit`)
                                  }
                                  aria-label={`Edit ${s.title}`}
                                >
                                  <Pencil size={16} /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-700"
                                  onClick={() => doDelete(s.id)}
                                  aria-label={`Delete ${s.title}`}
                                >
                                  <Trash2 size={16} /> Delete
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence initial={false}>
                    {paged.map((s) => (
                      <motion.div
                        key={s.id}
                        className="rounded-xl bg-white p-5 shadow hover:shadow-lg dark:bg-gray-900 transition"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {s.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {s.category}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="secondary"
                            className="flex-1 px-2 py-1 text-sm"
                            onClick={() => nav(`/admin/portfolio/${s.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="flex-1 px-2 py-1 text-sm text-red-600 hover:text-red-700"
                            onClick={() => doDelete(s.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {totalPages > 1 && (
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
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={pageSafe === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </motion.div>
  );
};

export default AdminPortfolioPage;
