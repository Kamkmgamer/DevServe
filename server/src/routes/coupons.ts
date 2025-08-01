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
const couponSchema = z.object({
  code:     z.string().min(1).trim().toUpperCase(),
  type:     z.enum(["percentage", "fixed"]),
  value:    z.number().int().positive(),
  minOrderAmount: z.number().int().nonnegative().optional().nullable(),
  maxUses:        z.number().int().positive().optional().nullable(),
  expiresAt:      z.string().datetime().optional().nullable(),
  active:    z.boolean().default(true),
});
const couponUpdateSchema = couponSchema.partial();

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