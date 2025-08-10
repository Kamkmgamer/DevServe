// client/src/pages/CheckoutPage.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import api from "../api/axios";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useCart, CartItem } from "../contexts/CartContext";
import { Link } from "react-router-dom";

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
  const { cart, total, createOrder } = useCart();
  const { register, handleSubmit, formState } = useForm<RequirementsData>({
    resolver: zodResolver(requirementsSchema),
  });

  const [orderId, setOrderId] = useState<string | null>(null);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState<number>(0);

  useEffect(() => {
    setTotalAfterDiscount(Math.max(total - discount, 0));
  }, [total, discount]);

  useEffect(() => {
    if (cart?.items.length === 0) {
      setDiscount(0);
      setCouponCode("");
      setStep(1);
    }
  }, [cart]);

  async function applyCoupon() {
    if (!couponCode.trim()) {
      toast.error("Please enter a code");
      return;
    }

    const code = couponCode.trim().toUpperCase();

    try {
      // Try to apply as a coupon first
      const { data } = await api.get(`/coupons/code/${code}`);
      const { value, type, minOrderAmount } = data;

      // Frontend check for min order amount for immediate feedback
      if (minOrderAmount && total * 100 < minOrderAmount) {
        toast.error(`Minimum order amount is ${(minOrderAmount / 100).toFixed(2)}`);
        return;
      }

      const discountAmount = type === "percentage" ? (total * (value / 100)) : (value / 100);

      setDiscount(discountAmount);
      setDiscountType(type);
      toast.success("Coupon applied successfully!");
    } catch (couponErr: any) {
      // If coupon application fails, try as a referral code
      if (couponErr.response && couponErr.response.status === 404) {
        try {
          await api.get(`/referral/validate/${code}`);
          // If referral code is valid, but no direct discount is applied
          setDiscount(0);
          setDiscountType(null);
          toast.success("Referral code validated. No direct discount applied.");
        } catch (referralErr: any) {
          setDiscount(0);
          setDiscountType(null);
          toast.error(referralErr.response?.data?.message || "Invalid code.");
        }
      } else {
        setDiscount(0);
        setDiscountType(null);
        toast.error(couponErr.response?.data?.message || "Failed to apply coupon.");
      }
    }
  }

  function removeCoupon() {
    setDiscount(0);
    setDiscountType(null);
    setCouponCode("");
    toast.success("Coupon removed");
  }

  async function onSubmit(data: RequirementsData) {
    try {
      const order = await createOrder(
        {
          name: data.name,
          email: data.email,
          notes: data.notes,
          requirements: data.notes || "No additional requirements",
        },
        discount
      );
      setOrderId(order.id);
      setStep(2);
      toast.success("Order created! Proceed to payment.");
    } catch (err: any) {
      console.error("Failed to create order:", err);
      toast.error(err.message || "Failed to proceed with order. Please try again.");
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/services">
          <Button>Browse Services</Button>
        </Link>
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
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Review & Checkout</h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 divide-y divide-gray-200 dark:divide-gray-700">
                  {cart?.items.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between items-center py-3">
                      <div>
                        <span className="font-medium">{item.service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">×{item.quantity}</span>
                      </div>
                      <span className="font-medium">${(item.service.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Coupon</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!discount}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!discount ? (
                    <Button onClick={applyCoupon} disabled={!couponCode.trim()}>Apply</Button>
                  ) : (
                    <Button variant="ghost" onClick={removeCoupon}>Remove</Button>
                  )}
                </div>
                {discount > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    {discountType === "percentage"
                      ? `Coupon applied: ${((discount / total) * 100).toFixed(0)}% off`
                      : `Coupon applied: -$${discount.toFixed(2)}`}
                  </div>
                )}
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${totalAfterDiscount.toFixed(2)}</span>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                      <input {...register("name")} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                      {formState.errors.name && <p className="text-red-500 text-sm mt-1">{formState.errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                      <input {...register("email")} type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                      {formState.errors.email && <p className="text-red-500 text-sm mt-1">{formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Requirements</label>
                      <textarea {...register("notes")} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Any specific requirements, branding preferences, timeline, etc..." />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="px-6 py-3">Continue to Payment</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
        {step === 2 && orderId && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Complete Payment</h2>
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Amount to pay</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalAfterDiscount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Order ID: {orderId}</p>
                </div>
              </div>
              <PayPalButtons
                createOrder={(_, actions) =>
                  actions.order.create({
                    intent: "AUTHORIZE",
                    purchase_units: [{ amount: { currency_code: "USD", value: totalAfterDiscount.toFixed(2) }, custom_id: orderId }],
                  })
                }
                onApprove={async (data, actions) => {
                  try {
                    const auth = await actions.order?.authorize();
                    const authorizationId = auth?.purchase_units?.[0].payments?.authorizations?.[0].id;
                    if (authorizationId) {
                      await api.post(`/orders/${orderId}/authorize`, { authorizationId });
                      toast.success("Payment completed! We'll begin our technical review shortly.");
                      setTimeout(() => { window.location.href = "/"; }, 2000);
                    } else {
                      toast.error("Could not get authorization from PayPal.");
                    }
                  } catch (err: any) {
                    console.error("Payment error:", err);
                    toast.error("Payment authorization failed: " + (err.message || "Unknown error"));
                  }
                }}
                onError={(err: any) => {
                  console.error("PayPal error:", err);
                  toast.error("Payment failed: " + (err.message || "Unknown error"));
                }}
                style={{ layout: "vertical" }}
              />
              <div className="mt-6 text-center">
                <Button variant="ghost" onClick={() => setStep(1)}>Back to Order Details</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Order Details", "Payment"];
  return (
    <div className="mb-8">
      <div className="flex justify-center gap-4">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step === index + 1 ? "bg-blue-600 text-white" : step > index + 1 ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
              {index + 1}
            </div>
            <span className={`ml-2 hidden sm:inline text-sm ${step === index + 1 ? "text-blue-600 font-semibold" : "text-gray-500"}`}>{label}</span>
            {index < steps.length - 1 && <div className={`w-8 h-0.5 ml-2 ${step > index + 1 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}