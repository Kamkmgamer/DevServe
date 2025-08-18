import React from "react";
// Import the PayPalButtons component from @paypal/react-paypal-js
import { PayPalButtons } from "@paypal/react-paypal-js";
// Import the *types* for PayPal functions from the core @paypal/paypal-js library
import type { OnApproveData, OnApproveActions, CreateOrderActions } from "@paypal/paypal-js";
import toast from "react-hot-toast";
import api from "../api/axios";

interface PaymentProcessorProps {
  orderId: string;
  totalAfterDiscount: string;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  orderId,
  totalAfterDiscount,
}) => {
  const createPayPalOrder = (
    _: Record<string, unknown>,
    actions: CreateOrderActions,
  ) => {
    return actions.order.create({
      intent: "AUTHORIZE",
      purchase_units: [
        { amount: { currency_code: "USD", value: totalAfterDiscount } },
      ],
    });
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    try {
      // Ensure actions.order is available before proceeding
      if (!actions.order) {
        throw new Error("PayPal order actions are not available.");
      }

      const auth = await actions.order.authorize();
      if (!auth) {
        throw new Error("PayPal authorization failed: No authorization object.");
      }

      // Explicitly check if purchase_units exist and have items
      if (!auth.purchase_units || auth.purchase_units.length === 0) {
        throw new Error("No purchase units found in PayPal authorization.");
      }

      const authorizationId =
        auth.purchase_units[0]?.payments?.authorizations?.[0]?.id;
      if (!authorizationId) {
        throw new Error("Could not get authorization ID from PayPal.");
      }

      await api.post(`/orders/${orderId}/authorize`, { authorizationId });
      toast.success("Order placed! We'll begin our technical review shortly.");
      // You might want to redirect the user or clear the cart here
    } catch (err: unknown) {
      console.error("PayPal approval error:", err);
      const message =
        (err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : undefined) || "There was an issue with your payment approval.";
      toast.error(message);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-2">Complete Your Payment</h2>
      <p className="text-gray-600 mb-6">
        Finalize your order by authorizing the payment below.
      </p>
      <PayPalButtons
        createOrder={createPayPalOrder}
        onApprove={onApprove}
        onError={(err: unknown) => {
          const message =
            (err && typeof err === "object" && "message" in err
              ? String((err as { message?: unknown }).message)
              : "Unknown error");
          toast.error(`Payment failed: ${message}`);
        }}
        style={{ layout: "vertical" }}
      />
    </div>
  );
};