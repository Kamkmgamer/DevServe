// client/src/pages/CouponFormPage.tsx
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Container from "../components/layout/Container";
import { Loader2 } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

// Fixed schema - make all fields match exactly
const couponFormSchema = z.object({
  code: z.string().trim().toUpperCase().min(1, "Code is required"),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().positive().int().optional(),
  expiresAt: z.string().optional(),
  active: z.boolean(),
});

// Use the exact schema type
type FormValues = z.infer<typeof couponFormSchema>;

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
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      minOrderAmount: undefined,
      maxUses: undefined,
      expiresAt: undefined,
      active: true,
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
      setValue("value", data.value / 100);
      setValue("minOrderAmount", data.minOrderAmount ? data.minOrderAmount / 100 : undefined);
      setValue("maxUses", data.maxUses || undefined);
      
      if (data.expiresAt) {
        const date = new Date(data.expiresAt);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setValue("expiresAt", localDate.toISOString().slice(0, 16));
      }
      
      setValue("active", data.active);
    } catch (err: any) {
      console.error("Error fetching coupon:", err);
      toast.error(err.response?.data?.message || "Failed to load coupon data");
      navigate("/admin/coupons");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError(null);
    
    try {
      const payload = {
        code: data.code.toUpperCase(),
        type: data.type,
        value: Math.round(data.value * 100),
        minOrderAmount: data.minOrderAmount ? Math.round(data.minOrderAmount * 100) : null,
        maxUses: data.maxUses || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        active: data.active,
      };

      console.log('Submitting coupon:', payload);

      if (isEdit) {
        await api.patch(`/coupons/${id}`, payload);
        toast.success("Coupon updated successfully!");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created successfully!");
      }
      
      navigate("/admin/coupons");
    } catch (err: any) {
      console.error("Error submitting coupon:", err);
      const message = err.response?.data?.error || err.response?.data?.message || "Failed to save coupon";
      setError(message);
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <Container className="py-20 text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
        <p className="mt-2 text-gray-500">Loading coupon...</p>
      </Container>
    );
  }

  return (
    <Container className="py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {isEdit ? "Edit Coupon" : "Create Coupon"}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Coupon Code *
          </label>
          <input
            {...register("code")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            placeholder="SUMMER2024"
            maxLength={50}
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
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
              min="0.01"
              max={couponType === "percentage" ? 100 : 999999}
              step="0.01"
              className="w-full px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              placeholder={couponType === "percentage" ? "20" : "10.00"}
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
              Minimum Order Amount ($)
            </label>
            <input
              {...register("minOrderAmount", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              placeholder="0.00"
            />
            {errors.minOrderAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.minOrderAmount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Uses
            </label>
            <input
              {...register("maxUses", { valueAsNumber: true })}
              type="number"
              min="1"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              placeholder="Unlimited"
            />
            {errors.maxUses && (
              <p className="mt-1 text-sm text-red-600">{errors.maxUses.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expires At
          </label>
          <input
            {...register("expiresAt")}
            type="datetime-local"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
          {errors.expiresAt && (
            <p className="mt-1 text-sm text-red-600">{errors.expiresAt.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            {...register("active")}
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-900 dark:text-gray-300">
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
      </form>
    </Container>
  );
};

export default CouponFormPage;