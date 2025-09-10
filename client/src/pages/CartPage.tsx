// client/src/pages/CartPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useCart } from "../contexts/CartContext";
import { useMemo } from "react";

const CartPage = () => {
  const { cart, loading, error, removeFromCart } = useCart();
  const navigate = useNavigate();

  const items = useMemo(() => cart?.items ?? [], [cart]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = item.service?.price ?? 0;
        const qty = item.quantity ?? 0;
        return sum + price * qty;
      }, 0),
    [items]
  );

  if (loading) {
    return (
      <Container className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading cart…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20 text-center">
        <p className="font-semibold text-red-600 dark:text-red-400">{error}</p>
        <Link
          to="/services"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Browse services
        </Link>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-slate-50 dark:bg-slate-950"
    >
      <Container className="max-w-3xl py-12">
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 text-center text-4xl font-bold text-slate-900 dark:text-white"
        >
          Your Cart
        </motion.h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Your cart is empty.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link to="/services">
                <Button variant="secondary">Browse services</Button>
              </Link>
              <Link to="/">
                <Button variant="cta-light">Back to home</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="mb-8 space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item, index) => {
                  const svc = item.service;
                  const svcName = svc?.name ?? "Unknown Service";
                  const svcPrice = svc?.price ?? 0;
                  const thumb = svc?.thumbnailUrl;
                  const svcId = svc?.id;

                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <Link
                        to={svcId ? `/services/${svcId}` : "/services"}
                        className="group flex items-center gap-4"
                      >
                        {thumb && (
                          <img
                            src={thumb}
                            alt={svcName}
                            className="h-16 w-16 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 transition-colors duration-300 group-hover:text-purple-600 dark:text-white">
                            {svcName}
                          </h2>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                              Qty: {item.quantity}
                            </span>
                            <span>•</span>
                            <span>${svcPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </Link>

                      <Button
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${svcName} from cart`}
                        className="text-red-500 hover:text-red-600"
                        title="Remove from cart"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <div className="mb-4 flex items-center justify-between border-t border-slate-200 pt-4 text-lg dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Total
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>

            <Button
              onClick={() => navigate("/checkout")}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 py-3 text-lg text-white shadow transition-all hover:from-purple-600 hover:to-indigo-600"
            >
              Proceed to Checkout
            </Button>

            <div className="mt-4 text-center">
              <Link
                to="/services"
                className="text-sm text-blue-600 hover:underline"
              >
                Continue shopping →
              </Link>
            </div>
          </>
        )}
      </Container>
    </motion.div>
  );
};

export default CartPage;