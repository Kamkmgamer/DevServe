import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { marked } from "marked";
import api from "../api/axios";
import Container from "../components/layout/Container";

type BlogPost = {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown content
  thumbnailUrl?: string;
  createdAt: string;
};

const BlogDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sanitizedHtml, setSanitizedHtml] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/blog/${id}`)
      .then((res) => setPost(res.data))
      .catch(() => setError("Post not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const pubDate = useMemo(() => {
    if (!post) return "";
    try {
      return new Date(post.createdAt).toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return new Date(post.createdAt).toLocaleDateString();
    }
  }, [post]);

  // Convert Markdown -> HTML asynchronously and sanitize (works with all marked versions)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!post) {
        setSanitizedHtml("");
        return;
      }
      const html = (await marked.parse(post.content, {
        breaks: true,
      })) as string;
      const safe = DOMPurify.sanitize(html);
      if (!cancelled) setSanitizedHtml(safe);
    })();
    return () => {
      cancelled = true;
    };
  }, [post]);

  if (loading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-16 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-red-600">
          {error || "Post not found."}
        </h2>
        <Link to="/blog" className="text-blue-600 hover:underline">
          &larr; Back to Blog
        </Link>
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
      <header className="bg-gradient-to-b from-slate-100 to-transparent py-8 dark:from-slate-900/40">
        <Container className="max-w-3xl">
          <motion.h1
            className="mb-2 text-4xl font-extrabold text-slate-900 dark:text-white md:text-5xl"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {post.title}
          </motion.h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Published on {pubDate}
          </p>
        </Container>
      </header>

      <main className="pb-16 pt-6">
        <Container className="max-w-3xl">
          {post.thumbnailUrl && (
            <motion.div
              layoutId={`blog-image-${post.id}`}
              className="mb-6 max-h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}

          <div className="prose dark:prose-invert prose-img:rounded-lg prose-headings:scroll-mt-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </div>

          <div className="mt-10">
            <Link
              to="/blog"
              className="inline-block text-blue-600 hover:underline"
            >
              &larr; Back to Blog
            </Link>
          </div>
        </Container>
      </main>
    </motion.div>
  );
};

export default BlogDetailsPage;