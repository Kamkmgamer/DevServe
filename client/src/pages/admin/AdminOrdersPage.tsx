import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Container from "../../components/layout/Container";

type Order = {
  id: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  lineItems: { service: { name: string } }[];
};

const statusOptions = [
  "PENDING",
  "PAID",
  "IN_TECHNICAL_REVIEW",
  "APPROVED",
  "FAILED",
  "REFUNDED",
  "CANCELED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get<Order[]>("/admin/orders")
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Failed to load orders"));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      toast.success("Status updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-gray-100">
        All Orders
      </h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border dark:border-gray-700 p-4 rounded-lg shadow bg-white dark:bg-gray-800"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-sm">
                  <strong>ID:</strong> {order.id}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {order.email}
                </p>
                <p className="text-sm">
                  <strong>Total:</strong> ${(order.total / 100).toFixed(2)}
                </p>
                <p className="text-sm">
                  <strong>Items:</strong>{" "}
                  {order.lineItems
                    .map((li) => li.service.name)
                    .join(", ")}
                </p>
                <p className="text-sm">
                  <strong>Created:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}