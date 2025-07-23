import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Container from "../components/layout/Container";
import { ServiceCard } from "../components/ui/ServiceCard";
import TagButton from "../components/ui/TagButton";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  thumbnailUrl?: string;
};

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api.get<Service[]>("/services")
      .then(res => setServices(res.data))
      .catch(err => setError(err.message || "Failed to load services."))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(services.map(s => s.category))];
  const filteredServices = activeCategory === "All"
    ? services
    : services.filter(service => service.category === activeCategory);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut" as const, // 👈 THE FIX
      },
    }),
  };

  if (loading) return (
    <Container className="flex flex-col items-center justify-center min-h-screen text-center">
      <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
      <p className="text-xl text-gray-700 dark:text-gray-200">Loading services...</p>
    </Container>
  );

  if (error) return (
    <Container className="py-20 text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold text-red-600"
      >
        Error Loading Services
      </motion.h2>
      <p className="mt-2 text-gray-500">{error}</p>
    </Container>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Container className="py-12 md:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }} // 👈 THE FIX
          className="text-center mb-14"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
            Solutions for Every Vision
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Explore our full suite of digital services designed to elevate your online presence and meet your unique business goals.
          </p>
          <Link to="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="inline mr-2 h-5 w-5" />
              Start a Project
            </motion.button>
          </Link>
        </motion.div>

        {/* Category Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category, i) => (
            <motion.div
              key={category}
              custom={i}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <TagButton
                label={category}
                isActive={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          <AnimatePresence>
            {filteredServices.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center text-gray-500 py-12"
              >
                No services found for this category.
              </motion.div>
            ) : (
              filteredServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  custom={i}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.02 }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default ServicesPage;