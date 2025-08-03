import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Container from "../components/layout/Container";

type BlogPost = {
  id: string;
  title: string;
  summary: string;
  content: string;
  thumbnailUrl?: string;
  createdAt: string;
};

const BlogDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <h2 className="text-2xl font-semibold text-red-600">{error || "Post not found."}</h2>
        <Link to="/blog" className="mt-4 block text-blue-600 hover:underline">
          ← Back to Blog
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
      <div className="bg-gradient-to-b from-slate-100 to-transparent py-8 dark:from-slate-900/40">
        <Container className="max-w-3xl">
          <motion.h1
            className="mb-2 text-4xl font-extrabold text-slate-900 dark:text-white md:text-5xl"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {post.title}
          </motion.h1>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Published on {pubDate}
          </div>
        </Container>
      </div>

      <Container className="max-w-3xl pb-16 pt-6">
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

        {/* Content */}
        <motion.div
          className="prose max-w-none dark:prose-invert prose-img:rounded-lg prose-headings:scroll-mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <Link
          to="/blog"
          className="mt-10 inline-block text-blue-600 hover:underline"
        >
          ← Back to Blog
        </Link>
      </Container>
    </motion.div>
  );
};

export default BlogDetailsPage;