// client/src/pages/ServiceDetailPage.tsx
import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api/axios"
import Container from "../components/layout/Container"
import Button from "../components/ui/Button"
import { useCart } from "../contexts/CartContext"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { CheckCircle, ShoppingCart } from "lucide-react"

type Service = {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  category: string
  thumbnailUrl?: string
  imageUrls: string[]
}

const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToCart } = useCart()

  useEffect(() => {
    api.get(`/services/${id}`)
      .then(res => setService(res.data))
      .catch(err => setError(err.message || "Failed to load service."))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = () => {
    if (service) {
      addToCart(service.id, 1)
      toast.success(`${service.name} added to cart!`)
    }
  }

  if (loading) return <Container className="py-20 text-center animate-pulse">Loading service...</Container>
  if (error) return <Container className="py-20 text-center text-red-500">{error}</Container>
  if (!service) return <Container className="py-20 text-center">Service not found.</Container>

  const mainImage = service.imageUrls[currentImageIndex] || service.thumbnailUrl!

  return (
    <Container className="py-20">
      <motion.div
        className="grid md:grid-cols-2 gap-12 items-start"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Main Image with shared layout */}
        <motion.div
          layoutId={`service-image-${service.id}`}
          className="overflow-hidden rounded-xl shadow-xl"
          transition={{ type: "spring", stiffness: 100 }}
        >
          <img
            src={mainImage}
            alt={service.name}
            className="w-full h-auto object-cover"
          />
        </motion.div>

        {/* Details & Carousel */}
        <div>
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
            {service.category}
          </span>
          <h1 className="text-4xl font-extrabold mb-6">{service.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {service.description}
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Supporting Images</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {service.imageUrls.map((url, idx) => (
                <motion.img
                  key={idx}
                  src={url}
                  alt={`Support ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-24 h-24 rounded-lg object-cover cursor-pointer border-2 transition-transform duration-300 ${
                    idx === currentImageIndex
                      ? "border-blue-500 scale-105"
                      : "border-gray-300"
                  }`}
                  whileHover={{ scale: 1.1 }}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">What's Included</h3>
            <ul className="space-y-2">
              {service.features.map((f, i) => (
                <li key={i} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg flex items-center justify-between shadow-md">
            <span className="text-3xl font-bold">${service.price.toFixed(2)}</span>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </motion.div>

      <Link to="/services" className="block mt-12 text-blue-600 hover:underline">
        ← Back to Services
      </Link>
    </Container>
  )
}

export default ServiceDetailPage
