import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Pencil, Search, SortAsc, SortDesc } from "lucide-react";
import toast from "react-hot-toast";

type BlogPost = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
};

type SortKey = "createdAt" | "title";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const undoTimer = useRef<number | null>(null);
  const lastDeletedRef = useRef<BlogPost | null>(null);

  const nav = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<BlogPost[]>("/blog");
      setPosts(res.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to load posts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [posts, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") {
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        cmp = a.title.localeCompare(b.title);
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
  }, [query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const doDelete = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    // Optimistic removal
    setPosts((prev) => prev.filter((p) => p.id !== id));
    lastDeletedRef.current = post;

    // Provide undo for 5s
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Post deleted.</span>
        <button
          onClick={() => {
            if (lastDeletedRef.current) {
              setPosts((prev) => [lastDeletedRef.current!, ...prev]);
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
    ), { duration: 5000 });

    // If not undone, perform server delete
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(async () => {
      const toDelete = lastDeletedRef.current;
      lastDeletedRef.current = null;
      try {
        await api.delete(`/blog/${id}`);
        toast.success("Post permanently deleted");
      } catch (error: any) {
        // Revert on failure
        const errorMessage = error.response?.data?.message || error.message || "Failed to delete post";
        if (toDelete) setPosts((prev) => [toDelete, ...prev]);
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
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Container className="py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Blog Posts
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage, search, and edit your content.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by title, summary, or ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72 rounded-md border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                           dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Sort by
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("createdAt")}
                  className={`h-9 px-3 text-sm ${
                    sortKey === "createdAt"
                      ? "text-blue-600 dark:text-blue-400"
                      : ""
                  }`}
                  aria-pressed={sortKey === "createdAt"}
                >
                  Date
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("title")}
                  className={`h-9 px-3 text-sm ${
                    sortKey === "title" ? "text-blue-600 dark:text-blue-400" : ""
                  }`}
                  aria-pressed={sortKey === "title"}
                >
                  Title
                </Button>
                <span className="inline-flex items-center">
                  {sortDir === "asc" ? (
                    <SortAsc className="h-4 w-4 text-gray-500" />
                  ) : (
                    <SortDesc className="h-4 w-4 text-gray-500" />
                  )}
                </span>
              </div>
            </div>
            <Button variant="primary" onClick={() => nav("/admin/blog/new")}>
              Add Post
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Summary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Created
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading && (
                  <tr>
                    <td colSpan={4} className="p-10">
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading posts…
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={4} className="p-10">
                      <div className="text-center text-sm text-red-600 dark:text-red-400">
                        {error}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && paged.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10">
                      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        No posts found. Try searching or create a new one.
                      </div>
                    </td>
                  </tr>
                )}

                <AnimatePresence initial={false}>
                  {!loading &&
                    !error &&
                    paged.map((p, idx) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          <button
                            className="text-left hover:underline"
                            onClick={() => nav(`/admin/blog/${p.id}/edit`)}
                          >
                            {p.title}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="max-w-[520px] truncate sm:max-w-[640px]">
                            {p.summary || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString()}{" "}
                          {new Date(p.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => nav(`/admin/blog/${p.id}/edit`)}
                              className="flex items-center gap-1 text-sm"
                              aria-label={`Edit ${p.title}`}
                            >
                              <Pencil size={16} /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => doDelete(p.id)}
                              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                              aria-label={`Delete ${p.title}`}
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

export default AdminBlogPage;