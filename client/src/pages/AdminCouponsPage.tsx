import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useCoupons } from "../hooks/useCoupons";
import { Grid, List } from "lucide-react";

const AdminCouponsPage: React.FC = () => {
  const { coupons, loading, error, deleteCoupon } = useCoupons();
  const [view, setView] = useState<"grid" | "list">("list");

  if (loading) {
    return (
      <Container className="py-8 text-center">
        <p>Loading coupons...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8 text-center text-red-500">
        <p>{error}</p>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Coupons</h1>
          <div className="flex items-center gap-3">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              onClick={() => setView("list")}
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              onClick={() => setView("grid")}
            >
              <Grid className="w-5 h-5" />
            </Button>
            <Button as={Link} to="/admin/coupons/new" variant="primary">
              Add New Coupon
            </Button>
          </div>
        </div>

        {coupons.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No coupons found. Create one!
          </p>
        ) : view === "list" ? (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Uses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Expires At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Active
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {coupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {coupon.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : `$${coupon.value.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {coupon.currentUses} / {coupon.maxUses || "Unlimited"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {coupon.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/coupons/${coupon.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <motion.div
                key={coupon.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition hover:shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{coupon.code}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      coupon.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Type: {coupon.type} <br />
                  Value:{" "}
                  {coupon.type === "percentage"
                    ? `${coupon.value}%`
                    : `$${coupon.value.toFixed(2)}`}{" "}
                  <br />
                  Uses: {coupon.currentUses} / {coupon.maxUses || "Unlimited"} <br />
                  Expires:{" "}
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString()
                    : "N/A"}
                </p>
                <div className="mt-4 flex justify-end gap-3">
                  <Link
                    to={`/admin/coupons/${coupon.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Container>
  );
};

export default AdminCouponsPage;
