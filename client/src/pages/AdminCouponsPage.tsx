import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import api from "../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Pencil } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Coupon[]>("/coupons");
      setCoupons(data);
    } catch {
      toast.error("Could not load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const doDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Container className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
            Coupons
          </h1>
          <Button
            variant="primary"
            onClick={() => navigate("/admin/coupons/new")}
          >
            Add Coupon
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-gray-800">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium">Code</th>
                  <th className="px-6 py-3 text-sm font-medium">Type</th>
                  <th className="px-6 py-3 text-sm font-medium">Value</th>
                  <th className="px-6 py-3 text-sm font-medium">Uses</th>
                  <th className="px-6 py-3 text-sm font-medium">Expires</th>
                  <th className="px-6 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {coupons.map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">{c.code}</td>
                      <td className="px-6 py-4 capitalize">{c.type}</td>
                      <td className="px-6 py-4">
                        {c.type === "percentage" ? `${c.value}%` : `$${c.value}`}
                      </td>
                      <td className="px-6 py-4">
                        {c.currentUses} / {c.maxUses ?? "∞"}
                      </td>
                      <td className="px-6 py-4">
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(`/admin/coupons/${c.id}/edit`)
                          }
                          className="flex items-center gap-1 text-sm"
                        >
                          <Pencil size={16} /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => doDelete(c.id)}
                          className="flex items-center gap-1 text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </motion.div>
  );
};

export default AdminCouponsPage;