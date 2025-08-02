// client/src/pages/CouponFormPage.tsx

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button"; 
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { couponFormSchema } from "../types"; 
// Define the FormValues type
type FormValues = z.infer<typeof couponFormSchema>;

const CouponFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0, // Ensure default value is a number
      minOrderAmount: null,
      maxUses: null,
      expiresAt: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          const res = await api.get(`/coupons/${id}`);
          const data = res.data;
          setValue("code", data.code);
          setValue("type", data.type);
          setValue("value", data.value); // Ensure value is a number
          setValue("minOrderAmount", data.minOrderAmount);
          setValue("maxUses", data.maxUses);
          setValue("expiresAt", data.expiresAt);
          setValue("isActive", data.isActive);
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.error || "Failed to load coupon data");
          navigate("/admin/coupons");
        }
      })();
    }
  }, [id, isEdit, navigate, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError(null);
    const payload = {
      code: data.code,
      type: data.type,
      value: data.value, // Ensure value is a number
      minOrderAmount: data.minOrderAmount,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt,
      isActive: data.isActive,
    };

    try {
      if (isEdit) {
        await api.patch(`/coupons/${id}`, payload);
      } else {
        await api.post("/coupons", payload);
      }
      toast.success(isEdit ? "Coupon updated!" : "Coupon created successfully!");
      navigate("/admin/coupons");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save coupon");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Coupon" : "Create Coupon"}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Coupon Code</label>
          <input
            {...register("code")}
            className="w-full border p-2 rounded"
          />
          {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Type</label>
          <select
            {...register("type")}
            className="w-full border p-2 rounded"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Value</label>
          <input
            {...register("value", { valueAsNumber: true })}
            type="number"
            className="w-full border p-2 rounded"
          />
          {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Minimum Order Amount (Optional)</label>
          <input
            {...register("minOrderAmount", { valueAsNumber: true })}
            type="number"
            className="w-full border p-2 rounded"
          />
          {errors.minOrderAmount && <p className="text-red-500 text-sm">{errors.minOrderAmount.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Maximum Uses (Optional)</label>
          <input
            {...register("maxUses", { valueAsNumber: true })}
            type="number"
            className="w-full border p-2 rounded"
          />
          {errors.maxUses && <p className="text-red-500 text-sm">{errors.maxUses.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Expires At (Optional)</label>
          <input
            {...register("expiresAt")}
            type="datetime-local"
            className="w-full border p-2 rounded"
          />
          {errors.expiresAt && <p className="text-red-500 text-sm">{errors.expiresAt.message}</p>}
        </div>
        <div className="flex items-center">
          <input
            {...register("isActive")}
            type="checkbox"
            className="h-4 w-4 text-indigo-600 rounded"
          />
          <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Active
          </label>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default CouponFormPage;