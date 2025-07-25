// client/src/pages/BlogDetailsPage.tsx
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import api from "../api/axios"
import Container from "../components/layout/Container"

type BlogPost = {
  id: string
  title: string
  summary: string
  content: string
  thumbnailUrl?: string
  createdAt: string
}

const BlogDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get(`/blog/${id}`)
      .then(res => setPost(res.data))
      .catch(() => setError("Post not found."))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <Container className="py-16 text-center">
        <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
        <Link to="/blog" className="text-blue-600 hover:underline mt-4 block">
          ← Back to Blog
        </Link>
      </Container>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Container className="py-16 max-w-3xl">
        <motion.h1
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {post.title}
        </motion.h1>

        <div className="text-sm text-gray-500 mb-6">
          Published on {new Date(post.createdAt).toLocaleDateString()}
        </div>

        {post.thumbnailUrl && (
          <motion.div
            layoutId={`blog-image-${post.id}`}
            className="overflow-hidden rounded-lg mb-6 max-h-[400px]"
            transition={{ type: "spring", stiffness: 100 }}
          >
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        <motion.div
          className="prose dark:prose-invert max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <Link
          to="/blog"
          className="inline-block mt-8 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Blog
        </Link>
      </Container>
    </motion.div>
  )
}

export default BlogDetailsPage
