import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

type Order = {
  id: string;
  email: string;
  total: number;
  status: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get<Order[]>("/admin/orders");
        setOrders(res.data);
      } catch (err) {
        toast.error("Failed to fetch orders");
      }
    };

    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-4 rounded-md shadow-sm bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {order.id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {order.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total:</strong> ${order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center">
                <label htmlFor={`status-${order.id}`} className="mr-2 text-sm">
                  Status:
                </label>
                <select
                  id={`status-${order.id}`}
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
