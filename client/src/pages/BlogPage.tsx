import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Container from "../components/layout/Container";

type BlogPost = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blog")
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Container className="py-16">
      <motion.h1
        className="text-4xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Our Latest Blog Posts
      </motion.h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{post.summary}</p>
            <div className="text-sm text-gray-400 mt-3">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <Link
              to={`/blog/${post.id}`}
              className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Read More →
            </Link>
          </motion.div>
        ))}
      </div>
    </Container>
  );
};

export default BlogPage;
