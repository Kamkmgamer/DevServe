// client/src/pages/AdminCouponsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import api from "../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Pencil, Copy } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number; // percentage OR cents
  minOrderAmount: number | null;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  /* ------------------------------------------------------------- */
  /* Helpers                                                       */
  /* ------------------------------------------------------------- */
  const formatCurrency = (cents: number | null) =>
    cents == null ? "-" : `$${(cents / 100).toFixed(2)}`;

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "Never";

  const getStatus = (active: boolean, expiresAt: string | null) => {
    const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
    if (!active) return "Inactive";
    if (expired) return "Expired";
    return "Active";
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Inactive":
        return "text-gray-600 bg-gray-100";
      case "Expired":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  /* ------------------------------------------------------------- */
  /* CRUD                                                          */
  /* ------------------------------------------------------------- */
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Coupon[] } | Coupon[]>("/coupons");

      // The server can return either the paginated shape or the plain array.
      const list = Array.isArray(res.data) ? res.data : res.data.data;

      setCoupons(list);
    } catch {
      toast.error("Could not load coupons");
    } finally {
      setLoading(false);
    }
  };

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

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(code);
      toast.success("Coupon code copied!");
      setTimeout(() => setCopySuccess(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  useEffect(() => {
    void fetchCoupons();
  }, []);

  /* ------------------------------------------------------------- */
  /* Render                                                        */
  /* ------------------------------------------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Container className="py-8">
        {/* Header ------------------------------------------------ */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
            Coupons
          </h1>
          <Button onClick={() => navigate("/admin/coupons/new")} variant="primary">
            Add Coupon
          </Button>
        </div>

        {/* Table ------------------------------------------------- */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow dark:bg-gray-800">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium">Code</th>
                  <th className="px-6 py-3 text-sm font-medium">Type</th>
                  <th className="px-6 py-3 text-sm font-medium">Value</th>
                  <th className="px-6 py-3 text-sm font-medium">Min Order</th>
                  <th className="px-6 py-3 text-sm font-medium">Uses</th>
                  <th className="px-6 py-3 text-sm font-medium">Status</th>
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
                      {/* Code ---------------------------------- */}
                      <td className="px-6 py-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{c.code}</span>
                          <button
                            title="Copy code"
                            onClick={() => copyToClipboard(c.code)}
                            className="text-gray-400 transition-colors hover:text-gray-600"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Type / Value --------------------------- */}
                      <td className="px-6 py-4 capitalize">{c.type}</td>
                      <td className="px-6 py-4 font-medium">
                        {c.type === "percentage"
                          ? `${c.value}%`
                          : formatCurrency(c.value)}
                      </td>

                      {/* Other fields --------------------------- */}
                      <td className="px-6 py-4">
                        {formatCurrency(c.minOrderAmount)}
                      </td>
                      <td className="px-6 py-4">
                        {c.currentUses} / {c.maxUses ?? "∞"}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const s = getStatus(c.active, c.expiresAt);
                          return (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor(
                                s
                              )}`}
                            >
                              {s}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(c.expiresAt)}
                      </td>

                      {/* Buttons -------------------------------- */}
                      <td className="space-x-2 px-6 py-4">
                        <Button
                          className="flex items-center gap-1 text-sm"
                          variant="secondary"
                          onClick={() => navigate(`/admin/coupons/${c.id}/edit`)}
                        >
                          <Pencil size={16} />
                          Edit
                        </Button>
                        <Button
                          className="flex items-center gap-1 text-sm"
                          variant="ghost"
                          onClick={() => doDelete(c.id)}
                        >
                          <Trash2 size={16} />
                          Delete
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