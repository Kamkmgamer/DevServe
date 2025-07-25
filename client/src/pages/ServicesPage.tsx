// client/src/pages/ServicesPage.tsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import Container from "../components/layout/Container"
import { motion } from "framer-motion"

type Service = {
  id: string
  name: string
  description: string
  category: string
  price: number
  thumbnailUrl?: string
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("All")

  useEffect(() => {
    api.get<Service[]>("/services")
      .then(res => setServices(res.data))
      .catch(err => setError(err.message || "Failed to load services."))
      .finally(() => setLoading(false))
  }, [])

  const categories = ["All", ...Array.from(new Set(services.map(s => s.category)))]
  const filtered = activeCategory === "All"
    ? services
    : services.filter(s => s.category === activeCategory)

  if (loading) return (
    <Container className="flex flex-col items-center justify-center min-h-screen text-center">
      <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
      <p className="text-xl text-gray-700 dark:text-gray-200">Loading services...</p>
    </Container>
  )
  if (error) return (
    <Container className="py-20 text-center">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-red-600">
        Error Loading Services
      </motion.h2>
      <p className="mt-2 text-gray-500">{error}</p>
    </Container>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Container className="py-12 md:py-16">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full border ${
                activeCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-700 dark:text-gray-200 border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            >
              <Link to={`/services/${s.id}`}>
                {s.thumbnailUrl && (
                  <motion.div
                    layoutId={`service-image-${s.id}`}
                    className="w-full h-48 overflow-hidden"
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    <img
                      src={s.thumbnailUrl}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{s.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {s.description}
                  </p>
                  <span className="text-lg font-bold">${s.price.toFixed(2)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </motion.div>
  )
}

export default ServicesPage
