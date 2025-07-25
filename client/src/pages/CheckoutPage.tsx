// client/src/pages/CheckoutPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { PayPalButtons } from "@paypal/react-paypal-js";
import toast from "react-hot-toast";
import { z } from "zod";
import api from "../api/axios";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useCart, CartItem } from "../contexts/CartContext";

const requirementsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  notes: z.string().optional(),
});

type RequirementsData = z.infer<typeof requirementsSchema>;

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const { cart, total, createOrder } = useCart();
  const { register, handleSubmit, formState } = useForm<RequirementsData>({
    resolver: zodResolver(requirementsSchema),
  });

  const [orderId, setOrderId] = useState<string | null>(null);
  const totalAfterDiscount = (Number(total) - Number(discount)).toFixed(2);

  async function applyCoupon() {
    if (!couponCode) return;
    try {
      const res = await api.get(`/coupons/${couponCode}`);
      setDiscount(res.data.value);
      toast.success("Coupon applied");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid coupon");
    }
  }

  async function onSubmit(data: RequirementsData) {
    try {
      const order = await createOrder(data, discount);
      setOrderId(order.id);
      setStep(2);
    } catch (err) {
      console.error("Failed to create order on submit", err);
      toast.error("Failed to proceed with order. Please try again.");
    }
  }

  return (
    <Container className="py-10">
      <Stepper step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Customer Info</h2>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Your name"
                />
                {formState.errors.name && (
                  <p className="text-red-500 text-sm">{formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  {...register("email")}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="you@example.com"
                />
                {formState.errors.email && (
                  <p className="text-red-500 text-sm">{formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  {...register("notes")}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Optional notes"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" className="px-6 py-2">Continue</Button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Review Order</h2>

              <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
                {cart?.items.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="flex justify-between py-2 text-gray-800 dark:text-gray-200"
                  >
                    <span>{item.service.name}</span>
                    <span>${item.service.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Button onClick={applyCoupon}>Apply</Button>
              </div>

              <div className="mt-6 text-right text-xl font-semibold text-gray-900 dark:text-white">
                Total: ${totalAfterDiscount}
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Proceed to Payment</Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && orderId && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Payment</h2>
              <PayPalButtons
                createOrder={(_, actions) =>
                  actions.order.create({
                    intent: "AUTHORIZE",
                    purchase_units: [
                      {
                        amount: {
                          currency_code: "USD",
                          value: totalAfterDiscount,
                        },
                      },
                    ],
                  })
                }
                onApprove={async (data, actions) => {
                  const auth = await actions.order?.authorize();
                  const authorizationId = auth?.purchase_units?.[0].payments?.authorizations?.[0].id;
                  if (authorizationId) {
                    await api.post(`/orders/${orderId}/authorize`, { authorizationId });
                    toast.success("Order placed! In technical review.");
                  } else {
                    toast.error("Could not get authorization from PayPal.");
                  }
                }}
                onError={(err: any) => toast.error("Payment failed: " + err.message)}
              />
              <div className="mt-6 text-center">
                <Button variant="ghost" onClick={() => setStep(2)}>Back to Review</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-6 mb-10">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors border-2 ${
            step === n
              ? "bg-blue-600 text-white border-blue-600"
              : step > n
              ? "bg-green-500 text-white border-green-500"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          }`}
        >
          {n}
        </div>
      ))}
    </div>
  );
}
