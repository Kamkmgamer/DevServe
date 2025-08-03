import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import Container from "../components/layout/Container";
import { Search, Tag } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  thumbnailUrl?: string;
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeYear, setActiveYear] = useState<string>("All");

  useEffect(() => {
    api
      .get("/blog")
      .then((res) => setPosts(res.data))
      .catch((err) =>
        setError(
          err?.response?.data?.error || err.message || "Failed to load posts."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    const ys = new Set<string>();
    posts.forEach((p) => ys.add(new Date(p.createdAt).getFullYear().toString()));
    return ["All", ...Array.from(ys).sort((a, b) => Number(b) - Number(a))];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = posts;
    if (activeYear !== "All") {
      list = list.filter(
        (p) => new Date(p.createdAt).getFullYear().toString() === activeYear
      );
    }
    if (!q) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q)
    );
  }, [posts, query, activeYear]);

  if (loading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-16 text-center">
        <h2 className="text-2xl font-semibold text-red-600">Error</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{error}</p>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-50 dark:bg-slate-950"
    >
      <div className="bg-gradient-to-b from-slate-100 to-transparent py-10 dark:from-slate-900/40">
        <Container>
          <motion.h1
            className="text-center text-4xl font-extrabold text-slate-900 dark:text-white md:text-5xl"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            Our Latest Blog Posts
          </motion.h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-300">
            Insights on web performance, UX, and modern development.
          </p>
        </Container>
      </div>

      <Container className="pb-16 pt-4">
        {/* Controls */}
        <div className="mb-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {years.map((y) => {
              const active = activeYear === y;
              return (
                <button
                  key={y}
                  onClick={() => setActiveYear(y)}
                  aria-pressed={active}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
                  ].join(" ")}
                >
                  <Tag className="h-4 w-4" />
                  {y}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-300">
              No posts found. Try another year or search term.
            </p>
            <Link to="/contact" className="mt-4 inline-block text-blue-600 hover:underline">
              Have a topic request?
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/blog/${post.id}`} className="block">
                    {post.thumbnailUrl && (
                      <motion.div
                        layoutId={`blog-image-${post.id}`}
                        className="relative h-44 w-full overflow-hidden"
                      >
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </motion.div>
                    )}
                    <div className="p-5">
                      <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {post.title}
                      </h2>
                      <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                        {post.summary}
                      </p>
                      <div className="mt-4 text-sm text-blue-600 group-hover:underline">
                        Read more →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Container>
    </motion.div>
  );
};

export default BlogPage;