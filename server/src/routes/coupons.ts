// src/routes/coupons.ts
import { Router, Request, Response } from "express";
import { z } from "zod";

const couponsRouter = Router();

// --- In-memory "Database" for Coupons ---
interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  // ✅ FIX: Allow null for optional properties to match Zod schema and usage
  minOrderAmount?: number | null;
  maxUses?: number | null;
  currentUses: number;
  expiresAt?: string | null; // ISO 8601 string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Initial dummy data
const coupons: Coupon[] = [
  {
    id: "coupon_1",
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    minOrderAmount: 50,
    maxUses: 100,
    currentUses: 5,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), // ✅ FIX: Corrected typo from ENON to Date
  },
  {
    id: "coupon_2",
    code: "FREEDOM10",
    type: "fixed",
    value: 10,
    minOrderAmount: 30,
    maxUses: 50,
    currentUses: 10,
    expiresAt: null, // This is now valid because of the interface change
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "coupon_3",
    code: "EXPIRED10",
    type: "percentage",
    value: 10,
    minOrderAmount: null, // This is now valid
    maxUses: null, // This is now valid
    currentUses: 1,
    expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Expired 7 days ago
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// --- Zod Schema for Coupon Validation ---
const couponSchema = z.object({
  code: z.string().min(1, "Code is required").trim().toUpperCase(),
  type: z.enum(["percentage", "fixed"], { message: "Invalid coupon type" }),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z
    .number()
    .positive("Min order amount must be positive")
    .optional()
    .nullable(),
  maxUses: z
    .number()
    .int()
    .positive("Max uses must be a positive integer")
    .optional()
    .nullable(),
  expiresAt: z.string().datetime().optional().nullable(), // ISO 8601 string
  isActive: z.boolean().default(true),
});

// For update, all fields are optional
const couponUpdateSchema = couponSchema.partial();

// --- API Endpoints ---

// GET all coupons (Admin only)
couponsRouter.get("/", (req: Request, res: Response) => {
  res.status(200).json(coupons);
});

// GET coupon by code (for public use / checkout page)
couponsRouter.get("/:code", (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const coupon = coupons.find((c) => c.code === code);

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  if (!coupon.isActive) {
    return res.status(400).json({ message: "Coupon is not active" });
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return res.status(400).json({ message: "Coupon has expired" });
  }
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return res.status(400).json({ message: "Coupon usage limit reached" });
  }

  res.status(200).json(coupon);
});

// POST create new coupon (Admin only)
couponsRouter.post("/", (req: Request, res: Response) => {
  try {
    const newCouponData = couponSchema.parse(req.body);

    if (coupons.some((c) => c.code === newCouponData.code)) {
      return res.status(409).json({ message: "Coupon code already exists" });
    }

    const newCoupon: Coupon = {
      id: `coupon_${Date.now()}`,
      ...newCouponData,
      currentUses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    coupons.push(newCoupon);
    res.status(201).json(newCoupon);
  } catch (error: any) {
    res.status(400).json({
      message: "Invalid coupon data",
      errors: error.issues || error.message,
    });
  }
});

// PUT update coupon by ID (Admin only)
couponsRouter.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const couponIndex = coupons.findIndex((c) => c.id === id);

  if (couponIndex === -1) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  try {
    const updatedData = couponUpdateSchema.parse(req.body);

    if (
      updatedData.code &&
      updatedData.code !== coupons[couponIndex].code &&
      coupons.some((c) => c.code === updatedData.code && c.id !== id)
    ) {
      return res.status(409).json({ message: "New coupon code already exists" });
    }

    coupons[couponIndex] = {
      ...coupons[couponIndex],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    res.status(200).json(coupons[couponIndex]);
  } catch (error: any) {
    res.status(400).json({
      message: "Invalid coupon update data",
      errors: error.issues || error.message,
    });
  }
});

// DELETE coupon by ID (Admin only)
couponsRouter.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = coupons.length;
  const updatedCoupons = coupons.filter((c) => c.id !== id);

  if (updatedCoupons.length === initialLength) {
    return res.status(404).json({ message: "Coupon not found" });
  }
  coupons.splice(0, coupons.length, ...updatedCoupons);
  res.status(204).send();
});

export default couponsRouter;