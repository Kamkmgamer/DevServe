import { useState, useEffect } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {  } from "react-hook-form";

/* ────────────────────────────────────────────────────────── */
/*  Helpers                                                  */
/* ────────────────────────────────────────────────────────── */
const optionalPositiveNumber = (whole = false) =>
  z.preprocess(
    (v) =>
      v === "" || v === null || v === undefined ? undefined : Number(v),
    whole
      ? z.number().int("Must be a whole number").positive().optional()
      : z.number().positive().optional()
  );

/* ────────────────────────────────────────────────────────── */
/*  Schema                                                   */
/* ────────────────────────────────────────────────────────── */
const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
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

/* ────────────────────────────────────────────────────────── */
/*  Component                                                */
/* ────────────────────────────────────────────────────────── */
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

  /* ───────── fetch existing when editing ───────── */
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
        toast.error(e.response?.data?.message ?? "Failed to load coupon");
        navigate("/admin/coupons");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate, setValue]);

  /* ───────── submit ───────── */
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

  /* ───────── render ───────── */
  if (loading)
    return (
      <Container className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500">Loading coupon…</p>
      </Container>
    );

  return (
    <Container className="max-w-2xl py-12">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        {isEdit ? "Edit Coupon" : "Create Coupon"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Code -------------------------------------------------- */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Coupon Code *
          </label>
          <input
            {...register("code")}
            maxLength={50}
            placeholder="SUMMER2025"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        {/* Type -------------------------------------------------- */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Discount Type *
          </label>
          <select
            {...register("type")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>

        {/* Value ------------------------------------------------- */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Discount Value *
          </label>
          <div className="relative">
            <input
              {...register("value")}
              type="number"
              min={couponType === "percentage" ? 1 : 0.01}
              max={couponType === "percentage" ? 100 : 999999}
              step={couponType === "percentage" ? 1 : 0.01}
              placeholder={couponType === "percentage" ? "20" : "10.00"}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {couponType === "percentage" ? "%" : "$"}
            </span>
          </div>
          {errors.value && (
            <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
          )}
        </div>

        {/* Min / Max ------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Minimum Order Amount ($)
            </label>
            <input
              {...register("minOrderAmount")}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />
            {errors.minOrderAmount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.minOrderAmount.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Maximum Uses
            </label>
            <input
              {...register("maxUses")}
              type="number"
              min="1"
              step="1"
              placeholder="Unlimited"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />
            {errors.maxUses && (
              <p className="mt-1 text-sm text-red-600">
                {errors.maxUses.message}
              </p>
            )}
          </div>
        </div>

        {/* Expires -------------------------------------------- */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Expires At
          </label>
          <input
            {...register("expiresAt")}
            type="datetime-local"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
          {errors.expiresAt && (
            <p className="mt-1 text-sm text-red-600">
              {errors.expiresAt.message}
            </p>
          )}
        </div>

        {/* Active --------------------------------------------- */}
        <div className="flex items-center">
          <input
            {...register("active")}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-900 dark:text-gray-300">
            Active
          </label>
        </div>

        {/* Buttons -------------------------------------------- */}
        <div className="flex gap-4">
          <Button className="flex-1" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Saving…"
              : isEdit
              ? "Update Coupon"
              : "Create Coupon"}
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            type="button"
            onClick={() => navigate("/admin/coupons")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default CouponFormPage;