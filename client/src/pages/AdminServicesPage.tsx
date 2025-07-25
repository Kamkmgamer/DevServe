// client/src/pages/AdminServicesPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import TagButton from "../components/ui/TagButton";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Grid, List } from "lucide-react";

type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
};

const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const nav = useNavigate();

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Service[]>("/services");
      setServices(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const doDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (e: any) {
      toast.error(e.response?.data?.error || e.message);
    }
  };

  // Unique categories, with "All" first
  const categories = Array.from(new Set(services.map((s) => s.category))).sort();
  categories.unshift("All");

  // Filtered list
  const visible =
    activeCategory === "All"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <Container className="py-12 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Manage Services
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              onClick={() => setViewMode("table")}
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-5 h-5" />
            </Button>
            <Button as={Link} to="/admin/services/new" variant="primary">
              Add Service
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <TagButton
              key={cat}
              label={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400">{error}</div>
        ) : visible.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-300">
            No services found in “{activeCategory}”
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {visible.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">{s.category}</td>
                    <td className="px-4 py-3 text-right">${s.price}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-sm"
                        onClick={() => nav(`/admin/services/${s.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-sm"
                        onClick={() => doDelete(s.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {visible.map((s) => (
                <motion.div
                  key={s.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {s.category}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
                    ${s.price}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1 px-2 py-1 text-sm"
                      onClick={() => nav(`/admin/services/${s.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 px-2 py-1 text-sm"
                      onClick={() => doDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Container>
    </motion.div>
  );
};

export default AdminServicesPage;
