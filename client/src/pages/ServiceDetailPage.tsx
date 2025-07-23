import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useCart } from "../contexts/CartContext";
import { CheckCircle, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Type definition
type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  category: string;
  imageUrls: string[];
};

const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    api
      .get(`/services/${id}`)
      .then((res) => setService(res.data))
      .catch((err) => setError(err.message || "Failed to load service."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (service) {
      addToCart(service.id, 1);
      toast.success(`${service.name} added to cart!`);
    }
  };

  if (loading) return <Container className="py-20 text-center text-lg animate-pulse">Loading service...</Container>;
  if (error) return <Container className="py-20 text-center text-red-500">{error}</Container>;
  if (!service) return <Container className="py-20 text-center">Service not found.</Container>;

  const mainImage = service.imageUrls[currentImageIndex] || "https://via.placeholder.com/800x600";

  return (
    <Container className="py-20">
      <motion.div
        className="grid md:grid-cols-2 gap-12 items-start"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Image Carousel */}
        <motion.div className="space-y-4" layout>
          <motion.img
            key={mainImage}
            src={mainImage}
            alt={service.name}
            className="w-full rounded-xl shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {service.imageUrls.map((url, index) => (
              <motion.img
                layoutId={`thumbnail-${index}`}
                key={index}
                src={url}
                alt={`Thumb ${index}`}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-24 h-24 rounded-lg object-cover cursor-pointer border-2 transition-all duration-300 ${
                  index === currentImageIndex ? "border-blue-500 scale-105" : "border-gray-300"
                }`}
                whileHover={{ scale: 1.1 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4 animate-fadeIn">
            {service.category}
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 animate-fadeIn">
            {service.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-fadeIn">
            {service.description}
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">What's Included</h3>
            <ul className="space-y-2">
              {service.features.map((feature, i) => (
                <motion.li
                  key={i}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg flex items-center justify-between shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              ${service.price}
            </span>
            <Button variant="primary" onClick={handleAddToCart} className="ml-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ServiceDetailPage;
