// client/src/pages/BlogPage.tsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import api from "../api/axios"
import Container from "../components/layout/Container"

type BlogPost = {
  id: string
  title: string
  summary: string
  createdAt: string
  thumbnailUrl?: string
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/blog")
      .then(res => setPosts(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
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
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            >
              {post.thumbnailUrl && (
                <motion.div
                  layoutId={`blog-image-${post.id}`}
                  className="overflow-hidden"
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              )}

              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {post.title}
                </h2>
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
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </motion.div>
  )
}

export default BlogPage
