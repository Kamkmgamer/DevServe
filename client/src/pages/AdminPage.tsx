import { useEffect, useState } from "react";
import Container from "../components/layout/Container";
import api from "../api/axios";
import { motion } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Users,
  ShoppingCart,
  Package,
  Layers,
} from "lucide-react";

type DashboardData = {
  userCount: number;
  serviceCount: number;
  orderCount: number;
  cartItemCount: number;
};

const AdminPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchData = () => {
    setLoading(true);
    setError("");
    api
      .get<DashboardData>("/admin")
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || err.message)
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="py-20 text-center">
        <Loader2 className="mx-auto h-10 w-10 text-purple-600 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Loading dashboard…
        </p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500"
        >
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </motion.div>
      </Container>
    );
  }

  const cards = [
    {
      label: "Users",
      value: data!.userCount,
      icon: <Users className="w-9 h-9 text-purple-600" />,
      gradient: "from-purple-50 via-purple-100 to-purple-200 dark:from-purple-900 dark:via-purple-800 dark:to-purple-700",
    },
    {
      label: "Services",
      value: data!.serviceCount,
      icon: <Layers className="w-9 h-9 text-blue-600" />,
      gradient: "from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700",
    },
    {
      label: "Orders",
      value: data!.orderCount,
      icon: <Package className="w-9 h-9 text-green-600" />,
      gradient: "from-green-50 via-green-100 to-green-200 dark:from-green-900 dark:via-green-800 dark:to-green-700",
    },
    {
      label: "Cart Items",
      value: data!.cartItemCount,
      icon: <ShoppingCart className="w-9 h-9 text-yellow-600" />,
      gradient: "from-yellow-50 via-yellow-100 to-yellow-200 dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-700",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Container className="py-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.04 }}
              className={`rounded-2xl p-6 shadow-md cursor-pointer bg-gradient-to-br ${card.gradient} transition-transform`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="bg-white dark:bg-gray-900 p-2 rounded-full shadow-sm">
                  {card.icon}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                {card.value}
              </h2>
              <p className="mt-1 text-lg text-gray-600 dark:text-gray-300 font-medium">
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </motion.div>
  );
};

export default AdminPage;
