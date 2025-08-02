// client/src/pages/CheckoutPage.tsx
import { useState, useEffect } from "react";
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
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | null>(null);
  const [couponId, setCouponId] = useState<string | null>(null);
  const { cart, total, createOrder } = useCart();
  const { register, handleSubmit, formState } = useForm<RequirementsData>({
    resolver: zodResolver(requirementsSchema),
  });

  const [orderId, setOrderId] = useState<string | null>(null);
  const totalAfterDiscount = Math.max(Number(total) - Number(discount), 0).toFixed(2);

  // Reset discount if cart changes
  useEffect(() => {
    if (cart?.items.length === 0) {
      setDiscount(0);
      setCouponCode("");
      setCouponId(null);
    }
  }, [cart]);

  async function applyCoupon() {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const { data } = await api.get(`/coupons/${couponCode.trim().toUpperCase()}`);
      const { value, type, minOrderAmount, maxUses, currentUses, expiresAt, active } = data;

      if (!active) {
        toast.error("This coupon is inactive");
        return;
      }

      if (expiresAt && new Date(expiresAt) < new Date()) {
        toast.error("This coupon has expired");
        return;
      }

      if (maxUses && currentUses >= maxUses) {
        toast.error("This coupon has reached its usage limit");
        return;
      }

      if (minOrderAmount && total < minOrderAmount / 100) {
        toast.error(`Minimum order amount is $${(minOrderAmount / 100).toFixed(2)}`);
        return;
      }

      const discountAmount = type === "percentage"
        ? (total * (value / 100))
        : (value / 100);

      setDiscount(discountAmount);
      setDiscountType(type);
      setCouponId(data.id);
      toast.success("Coupon applied successfully!");
    } catch (err: any) {
      setDiscount(0);
      setCouponId(null);
      toast.error(err.response?.data?.message || "Invalid or expired coupon");
    }
  }

  function removeCoupon() {
    setDiscount(0);
    setDiscountType(null);
    setCouponCode("");
    setCouponId(null);
    toast.success("Coupon removed");
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

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => window.location.href = "/services"}>
          Browse Services
        </Button>
      </Container>
    );
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Your full name"
                />
                {formState.errors.name && (
                  <p className="text-red-500 text-sm">{formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="you@example.com"
                />
                {formState.errors.email && (
                  <p className="text-red-500 text-sm">{formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes</label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" className="px-6 py-2">Continue to Payment</Button>
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
                    className="flex justify-between items-center py-3 text-gray-800 dark:text-gray-200"
                  >
                    <div>
                      <span className="font-medium">{item.service.name}</span>
                      <span className="text-sm text-gray-500 ml-2">×{item.quantity}</span>
                    </div>
                    <span>${(item.service.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!discount}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                  />
                  {!discount ? (
                    <Button onClick={applyCoupon}>Apply</Button>
                  ) : (
                    <Button variant="ghost" onClick={removeCoupon}>Remove</Button>
                  )}
                </div>
                {discount > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    {discountType === "percentage" 
                      ? `Coupon applied: ${(discount / total * 100).toFixed(0)}% off`
                      : `Coupon applied: -$${discount.toFixed(2)}`}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-semibold text-gray-900 dark:text-white border-t pt-2">
                  <span>Total:</span>
                  <span>${totalAfterDiscount}</span>
                </div>
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
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Complete Payment</h2>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Amount to pay</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalAfterDiscount}</p>
                </div>
              </div>

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
                  try {
                    const auth = await actions.order?.authorize();
                    const authorizationId = auth?.purchase_units?.[0].payments?.authorizations?.[0].id;
                    
                    if (authorizationId) {
                      await api.post(`/orders/${orderId}/authorize`, { authorizationId });
                      toast.success("Order placed! We'll begin our technical review shortly.");
                      // Optionally redirect to success page
                    } else {
                      toast.error("Could not get authorization from PayPal.");
                    }
                  } catch (err: any) {
                    toast.error("Payment authorization failed: " + (err.message || "Unknown error"));
                  }
                }}
                onError={(err: any) => toast.error("Payment failed: " + (err.message || "Unknown error"))}
                style={{ layout: "vertical" }}
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
  const steps = ["Customer Info", "Review Order", "Payment"];
  
  return (
    <div className="mb-8">
      <div className="flex justify-center gap-4">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step === index + 1
                  ? "bg-blue-600 text-white"
                  : step > index + 1
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              {index + 1}
            </div>
            <span className={`ml-2 hidden sm:inline text-sm ${
              step === index + 1 ? "text-blue-600 font-semibold" : "text-gray-500"
            }`}>
              {label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ml-2 ${
                step > index + 1 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}