import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";

const CartPage = () => {
  const { cart, loading, error, removeFromCart } = useCart();

  const items = cart?.items || [];
  const total = items.reduce(
    (sum, item) => sum + (item.service?.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return (
      <Container className="py-20 text-center">
        <Loader2 className="animate-spin w-8 h-8 mx-auto text-purple-600" />
        <p className="mt-2 text-gray-500">Loading cart…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20 text-center">
        <p className="text-red-500 font-semibold">{error}</p>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Container className="py-12 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-center mb-8"
        >
          Your Cart
        </motion.h1>

        {items.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 text-lg"
          >
            Your cart is empty. <Link to="/services" className="underline text-blue-600">Browse services</Link>
          </motion.p>
        ) : (
          <>
            <ul className="space-y-6 mb-8">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-md transition-shadow"
                  >
                    <Link
                      to={`/services/${item.service?.id}`}
                      className="flex items-center gap-4 group"
                    >
                      {item.service?.thumbnailUrl && (
                        <img
                          src={item.service.thumbnailUrl}
                          alt={item.service.name || "Service thumbnail"}
                          className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors duration-300">
                          {item.service?.name || "Unknown Service"}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Price: ${item.service?.price?.toFixed(2) || "N/A"}
                        </p>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="flex justify-between items-center mb-8 text-lg">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>

            <Button
              onClick={() => toast.success("Proceeding to checkout...")}
              className="w-full py-3 text-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl shadow transition-all"
            >
              Proceed to Checkout
            </Button>
          </>
        )}
      </Container>
    </motion.div>
  );
};

export default CartPage;
