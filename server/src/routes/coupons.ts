// server/src/routes/coupons.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const couponSchema = z.object({
  code: z.string().min(1, "Code is required").trim().toUpperCase(),
  type: z.enum(["percentage", "fixed"], { message: "Invalid coupon type" }),
  value: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0, { message: "Value must be positive" }),
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
  expiresAt: z.string().datetime({ message: "Invalid date format." }).optional().nullable(),
  isActive: z.boolean().default(true),
});

const couponUpdateSchema = couponSchema.partial();

router.use(authMiddleware);

router.get("/", async (_req, res) => {
  const coupons = await prisma.coupon.findMany();
  res.json(coupons);
});

router.post("/", async (req, res) => {
  try {
    const data = couponSchema.parse(req.body);
    const coupon = await prisma.coupon.create({ data });
    res.status(201).json(coupon);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

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

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.coupon.delete({ where: { id } });
  res.status(204).send();
});

export default router;