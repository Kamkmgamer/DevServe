// src/pages/CouponFormPage.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import api from "../api/axios";
import { couponFormSchema, CouponFormData, Coupon } from "../types";

const CouponFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormData>({
    // Cast resolver to any to suppress TS mismatch from raw string inputs
    resolver: zodResolver(couponFormSchema) as any,
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      minOrderAmount: null,
      maxUses: null,
      expiresAt: null, // Default to null for datetime-local
      isActive: true,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      (async () => {
        try {
          const res = await api.get<Coupon>(`/coupons/${id}`);
          const data = res.data;
          reset({
            ...data,
            // Convert backend ISO string to "YYYY-MM-DDTHH:mm" for HTML input
            expiresAt: data.expiresAt
              ? new Date(data.expiresAt).toISOString().slice(0, 16)
              : null, // Ensure null if backend sends null or undefined
          });
        } catch (err: any) {
          console.error(err);
          toast.error(
            err.response?.data?.message || "Failed to load coupon data"
          );
          navigate("/admin/coupons");
        }
      })();
    }
  }, [id, isEditMode, navigate, reset]);

  const onSubmit: SubmitHandler<CouponFormData> = async (data) => {
    // Build payload to strictly match backend Zod schema
    const payload = {
      code: data.code,
      type: data.type,
      value: data.value.toString(), // Convert to string
      minOrderAmount: data.minOrderAmount ? data.minOrderAmount.toString() : null, // Convert to string or null
      maxUses: data.maxUses ? data.maxUses.toString() : null, // Convert to string or null
      // Convert `expiresAt` to ISO string or null
      expiresAt: data.expiresAt
        ? new Date(data.expiresAt).toISOString() // Converts "YYYY-MM-DDTHH:mm" to ISO string
        : null, // Crucial: If data.expiresAt is empty string "", convert it to null
      isActive: data.isActive, // Comes as boolean
    };

    console.log("Submitting payload:", payload);

    try {
      const url = isEditMode ? `/coupons/${id}` : "/coupons";
      const method = isEditMode ? api.put : api.post;
      await method(url, payload);
      toast.success(
        isEditMode ? "Coupon updated!" : "Coupon created successfully!"
      );
      navigate("/admin/coupons");
    } catch (err: any) {
      console.error("API error:", err.response?.data);
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.map((e: any) => e.message).join(", ")
          : "Bad request");
      toast.error("Save failed: " + msg);
    }
  };

  return (
    <Container className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-8 rounded shadow"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isEditMode ? "Edit Coupon" : "Create Coupon"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Coupon Code"
            {...register("code")}
            error={errors.code}
            placeholder="e.g., BLACKFRIDAY20"
            readOnly={isEditMode}
          />

          <InputField
            label="Type"
            as="select"
            {...register("type")}
            error={errors.type}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </InputField>

          <InputField
            label="Value"
            type="number"
            step="0.01"
            {...register("value", { valueAsNumber: true })}
            error={errors.value}
            placeholder="e.g., 10"
          />

          <InputField
            label="Minimum Order Amount (Optional)"
            type="number"
            step="0.01"
            {...register("minOrderAmount", { valueAsNumber: true })}
            error={errors.minOrderAmount}
            placeholder="e.g., 50.00"
          />

          <InputField
            label="Maximum Uses (Optional)"
            type="number"
            step="1"
            {...register("maxUses", { valueAsNumber: true })}
            error={errors.maxUses}
            placeholder="e.g., 100"
          />

          <InputField
            label="Expires At (Optional)"
            type="datetime-local"
            {...register("expiresAt")} // No valueAsDate, handle transformation manually
            error={errors.expiresAt}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")} // Already boolean due to default value or previous setValueAs
              className="h-4 w-4 text-indigo-600 rounded"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Active
            </label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/coupons")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Update Coupon"
                : "Create Coupon"}
            </Button>
          </div>
        </form>
      </motion.div>
    </Container>
  );
};

export default CouponFormPage;