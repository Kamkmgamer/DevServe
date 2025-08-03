import { useState, useEffect } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

// Helpers
const optionalPositiveNumber = (whole = false) =>
  z.preprocess(
    (v) =>
      v === "" || v === null || v === undefined ? undefined : Number(v),
    whole
      ? z.number().int("Must be a whole number").positive().optional()
      : z.number().positive().optional()
  );

// Schema
const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .max(50, "Max 50 characters")
      .transform((s) => s.toUpperCase()),
    type: z.enum(["percentage", "fixed"]),
    value: z.preprocess(
      (v) => Number(v),
      z.number().positive("Value must be a positive number")
    ),
    minOrderAmount: optionalPositiveNumber(),
    maxUses: optionalPositiveNumber(true),
    expiresAt: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().optional()
    ),
    active: z.boolean(),
  })
  .refine((d) => (d.type === "percentage" ? d.value <= 100 : true), {
    path: ["value"],
    message: "Percentage value may not exceed 100",
  });

type FormValues = z.infer<typeof couponFormSchema>;

const CouponFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(couponFormSchema) as Resolver<FormValues>,
    defaultValues: {
      code: "",
      type: "percentage",
      value: 1,
      active: true,
      minOrderAmount: undefined,
      maxUses: undefined,
      expiresAt: undefined,
    },
  });

  const couponType = watch("type");
  const value = watch("value");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/coupons/${id}`);
        setValue("code", data.code);
        setValue("type", data.type);
        setValue(
          "value",
          data.type === "percentage" ? data.value : data.value / 100
        );
        setValue(
          "minOrderAmount",
          data.minOrderAmount ? data.minOrderAmount / 100 : undefined
        );
        setValue("maxUses", data.maxUses ?? undefined);
        if (data.expiresAt) {
          const utc = new Date(data.expiresAt);
          const local = new Date(
            utc.getTime() - utc.getTimezoneOffset() * 60000
          );
          setValue("expiresAt", local.toISOString().slice(0, 16));
        }
        setValue("active", data.active);
      } catch (e: any) {
        const msg =
          e.response?.data?.message ?? "Failed to load coupon";
        setError(msg);
        toast.error(msg);
        navigate("/admin/coupons");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError(null);
    const payload = {
      ...data,
      value:
        data.type === "percentage"
          ? Math.round(data.value)
          : Math.round(data.value * 100),
      minOrderAmount: data.minOrderAmount
        ? Math.round(data.minOrderAmount * 100)
        : null,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt
        ? new Date(data.expiresAt).toISOString()
        : null,
    };

    try {
      if (isEdit) {
        await api.patch(`/coupons/${id}`, payload);
        toast.success("Coupon updated");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created");
      }
      navigate("/admin/coupons");
    } catch (e: any) {
      const msg =
        e.response?.data?.message ?? e.response?.data?.error ?? "Save failed";
      setError(msg);
      toast.error(msg);
    }
  };

  if (loading)
    return (
      <Container className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500">Loading coupon…</p>
      </Container>
    );

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <Container className="py-10">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Coupon" : "Create Coupon"}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Fill in the details below for the coupon.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/admin/coupons")}>
            Back to list
          </Button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
          noValidate
        >
          {/* Basic Info Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Basic Info
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
                >
                  Coupon Code *
                </label>
                <input
                  id="code"
                  {...register("code")}
                  maxLength={50}
                  placeholder="SUMMER2025"
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                  aria-invalid={!!errors.code}
                  aria-describedby={errors.code ? "code-error" : undefined}
                />
                {errors.code && (
                  <p id="code-error" className="mt-1 text-sm text-red-500">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
                >
                  Discount Type *
                </label>
                <select
                  id="type"
                  {...register("type")}
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="value"
                  className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
                >
                  Discount Value *
                </label>
                <div className="relative">
                  <input
                    id="value"
                    {...register("value")}
                    type="number"
                    min={couponType === "percentage" ? 1 : 0.01}
                    max={couponType === "percentage" ? 100 : 999999}
                    step={couponType === "percentage" ? 1 : 0.01}
                    placeholder={
                      couponType === "percentage" ? "20" : "10.00"
                    }
                    className="w-full rounded border border-slate-300 pl-4 p-2 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {couponType === "percentage" ? "%" : "$"}
                  </span>
                </div>
                {errors.value && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.value.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Conditions Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Conditions
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="minOrderAmount"
                  className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
                >
                  Minimum Order Amount ($)
                </label>
                <input
                  id="minOrderAmount"
                  {...register("minOrderAmount")}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                />
                {errors.minOrderAmount && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.minOrderAmount.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="maxUses"
                  className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
                >
                  Maximum Uses
                </label>
                <input
                  id="maxUses"
                  {...register("maxUses")}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Unlimited"
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                />
                {errors.maxUses && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.maxUses.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="expiresAt"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Expires At
              </label>
              <input
                id="expiresAt"
                {...register("expiresAt")}
                type="datetime-local"
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
              />
              {errors.expiresAt && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.expiresAt.message}
                </p>
              )}
            </div>
          </section>

          {/* Activation Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Activation
            </h2>
            <div className="flex items-center">
              <input
                {...register("active")}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="active"
                className="ml-2 text-sm text-slate-800 dark:text-slate-100"
              >
                Active
              </label>
            </div>
          </section>

          {/* Spacer for sticky bar */}
          <div className="h-20" />
          {/* Sticky Action Bar */}
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <Container className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {isEdit ? "Editing coupon" : "Creating new coupon"}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => navigate("/admin/coupons")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : isEdit ? "Update Coupon" : "Create Coupon"}
                </Button>
              </div>
            </Container>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default CouponFormPage;