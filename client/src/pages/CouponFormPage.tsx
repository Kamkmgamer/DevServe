// client/src/pages/CouponFormPage.tsx
import { useState, useEffect } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import api from "../api/axios";
import { toast } from "react-hot-toast";

// Define the schema for coupon form - simplified to avoid type conflicts
const couponFormSchema = z.object({
  code: z.string().trim().toUpperCase().min(1, "Code is required"),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().positive().int().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Use the schema as-is without the inferred type issues
type FormValues = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive: boolean;
};

const CouponFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(couponFormSchema) as any, // Cast to any to avoid resolver type issues
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      minOrderAmount: undefined,
      maxUses: undefined,
      expiresAt: undefined,
      isActive: true,
    },
  });

  const couponType = watch("type");

  useEffect(() => {
    if (isEdit && id) {
      fetchCoupon();
    }
  }, [id, isEdit]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/coupons/${id}`);
      const data = res.data;
      
      setValue("code", data.code);
      setValue("type", data.type);
      setValue("value", data.value);
      setValue("minOrderAmount", data.minOrderAmount || undefined);
      setValue("maxUses", data.maxUses || undefined);
      setValue("expiresAt", data.expiresAt ? new Date(data.expiresAt).toISOString().slice(0, 16) : undefined);
      setValue("isActive", data.active);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load coupon data");
      navigate("/admin/coupons");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError(null);
    
    const payload = {
      ...data,
      minOrderAmount: data.minOrderAmount || null,
      maxUses: data.maxUses || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
    };

    try {
      if (isEdit) {
        await api.patch(`/coupons/${id}`, payload);
        toast.success("Coupon updated!");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created successfully!");
      }
      navigate("/admin/coupons");
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to save coupon";
      setError(message);
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {isEdit ? "Edit Coupon" : "Create Coupon"}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Coupon Code *
          </label>
          <input
            {...register("code")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            placeholder="SUMMER2024"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Discount Type *
          </label>
          <select
            {...register("type")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Discount Value *
          </label>
          <div className="relative">
            <input
              {...register("value", { valueAsNumber: true })}
              type="number"
              min="0"
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder={couponType === "percentage" ? "20" : "1000"}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {couponType === "percentage" ? "%" : "$"}
            </span>
          </div>
          {errors.value && (
            <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Order Amount (Optional)
            </label>
            <div className="relative">
              <input
                {...register("minOrderAmount", { valueAsNumber: true })}
                type="number"
                min="0"
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
            </div>
            {errors.minOrderAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.minOrderAmount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Uses (Optional)
            </label>
            <input
              {...register("maxUses", { valueAsNumber: true })}
              type="number"
              min="1"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Unlimited"
            />
            {errors.maxUses && (
              <p className="mt-1 text-sm text-red-600">{errors.maxUses.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expires At (Optional)
          </label>
          <input
            {...register("expiresAt")}
            type="datetime-local"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.expiresAt && (
            <p className="mt-1 text-sm text-red-600">{errors.expiresAt.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            {...register("isActive")}
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Active
          </label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/coupons")}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </form>
    </div>
  );
};

export default CouponFormPage;