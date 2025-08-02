// src/types/index.ts 
import { z } from "zod";

export const couponFormSchema = z.object({
  code: z.string().trim().toUpperCase().min(1, "Code is required"),
  type: z.enum(["percentage", "fixed"]),

  // For a required number, we still start with a string to handle form input
  value: z
    .string()
    .min(1, { message: "Value is required." })
    .transform(Number) // Transform to number
    .refine((val) => val > 0, { message: "Value must be positive." }), // Then validate

  // For optional fields, we start with a string and transform it
  minOrderAmount: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? Number(val) : null)) // If string exists, convert to number, else null
    .refine((val) => val === null || val > 0, {
      message: "Minimum order amount must be positive.",
    }),

  maxUses: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? Number(val) : null))
    .refine((val) => val === null || (Number.isInteger(val) && val > 0), {
      message: "Maximum uses must be a positive whole number.",
    }),

  expiresAt: z
    .string()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)) // If string exists, use it, else null
    .refine((val) => val === null || !isNaN(Date.parse(val)), {
      message: "Invalid date format.",
    }),

  isActive: z.boolean().default(true),
});

// Infer the type from the Zod schema. This will now be correct.
export type CouponFormData = z.infer<typeof couponFormSchema>;

// --- Coupon Type (for API responses) ---
export interface Coupon extends CouponFormData {
  id: string;
  currentUses: number;
  createdAt: string;
  updatedAt: string;
}