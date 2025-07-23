import { useEffect, useState } from "react";
import Container from "../components/layout/Container";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Users, ShoppingCart, Package, Layers } from "lucide-react";

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
    api.get<DashboardData>("/admin")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="py-20 text-center">
        <Loader2 className="mx-auto h-10 w-10 text-purple-600 animate-spin" />
        <p className="mt-4 text-gray-600">Loading dashboard…</p>
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
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
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
      icon: <Users className="w-8 h-8 text-purple-500" />,
      color: "from-purple-100 to-purple-300",
    },
    {
      label: "Services",
      value: data!.serviceCount,
      icon: <Layers className="w-8 h-8 text-blue-500" />,
      color: "from-blue-100 to-blue-300",
    },
    {
      label: "Orders",
      value: data!.orderCount,
      icon: <Package className="w-8 h-8 text-green-500" />,
      color: "from-green-100 to-green-300",
    },
    {
      label: "Cart Items",
      value: data!.cartItemCount,
      icon: <ShoppingCart className="w-8 h-8 text-yellow-500" />,
      color: "from-yellow-100 to-yellow-300",
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`p-6 bg-gradient-to-br ${card.color} rounded-2xl shadow-lg cursor-pointer transform transition-transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>{card.icon}</div>
                <span className="text-sm font-medium text-gray-600">Today</span>
              </div>
              <h2 className="text-3xl font-extrabold">{card.value}</h2>
              <p className="text-gray-700">{card.label}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </motion.div>
  );
};

export default AdminPage;
