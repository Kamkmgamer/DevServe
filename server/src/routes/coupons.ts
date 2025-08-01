// server/src/routes/coupons.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/* ------------------------------------------------------------
   Validation schemas
------------------------------------------------------------ */
// server/src/routes/coupons.ts

const couponSchema = z.object({
  code: z.string().min(1, "Code is required").trim().toUpperCase(),
  type: z.enum(["percentage", "fixed"], { message: "Invalid coupon type" }),
  value: z.string().transform((val) => parseInt(val, 10)).positive("Value must be positive"),
  minOrderAmount: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val ? parseInt(val, 10) : null)
    .refine((val) => val === null || val > 0, { message: "Minimum order amount must be positive." }),
  maxUses: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val ? parseInt(val, 10) : null)
    .refine((val) => val === null || (Number.isInteger(val) && val > 0), { message: "Maximum uses must be a positive whole number." }),
  expiresAt: z.string().optional().nullable().datetime({ message: "Invalid date format." }),
  isActive: z.boolean().default(true),
});

/* ------------------------------------------------------------
   Routes
------------------------------------------------------------ */

/* Public – validate coupon by code */
router.get("/:code", async (req, res) => {
  const code = req.params.code.toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon)               return res.status(404).json({ message: "Coupon not found" });
  if (!coupon.active)        return res.status(400).json({ message: "Coupon is not active" });
  if (coupon.expiresAt && coupon.expiresAt < new Date())
                             return res.status(400).json({ message: "Coupon has expired" });
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses)
                             return res.status(400).json({ message: "Coupon usage limit reached" });

  res.json(coupon);
});

/* Everything below is protected */
router.use(authMiddleware);

/* GET all coupons (admin list) */
router.get("/", async (_req, res) => {
  const coupons = await prisma.coupon.findMany();
  res.json(coupons);
});

/* POST create coupon */
router.post("/", async (req, res) => {
  try {
    const data = couponSchema.parse(req.body);
    const coupon = await prisma.coupon.create({ data });
    res.status(201).json(coupon);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

/* PUT update coupon */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = couponUpdateSchema.parse(req.body);
    const coupon = await prisma.coupon.update({ where: { id }, data });
    res.json(coupon);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

/* DELETE coupon */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.coupon.delete({ where: { id } });
  res.status(204).send();
});

export default router;