// server/src/routes/coupons.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Fix the coupon schema to properly handle numbers
const couponSchema = z.object({
  code: z.string().min(1, "Code is required").trim().toUpperCase(),
  type: z.enum(["percentage", "fixed"], { message: "Invalid coupon type" }),
  value: z.number().positive("Value must be a positive number"),
  minOrderAmount: z
    .number()
    .positive("Minimum order amount must be positive")
    .optional()
    .nullable(),
  maxUses: z
    .number()
    .positive("Maximum uses must be positive")
    .int("Maximum uses must be a whole number")
    .optional()
    .nullable(),
  expiresAt: z.string().datetime({ message: "Invalid date format." }).optional().nullable(),
  isActive: z.boolean().default(true),
});

const couponUpdateSchema = couponSchema.partial();

router.use(authMiddleware);

// GET /api/coupons
router.get("/", async (_req, res) => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

// GET /api/coupons/:id
router.get("/:id", async (req, res) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: req.params.id }
    });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ message: "Failed to fetch coupon" });
  }
});

// POST /api/coupons
router.post("/", async (req, res) => {
  try {
    const data = couponSchema.parse(req.body);
    
    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code }
    });
    
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    
    const coupon = await prisma.coupon.create({ 
      data: {
        ...data,
        currentUses: 0
      }
    });
    res.status(201).json(coupon);
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: e.errors 
      });
    }
    console.error("Error creating coupon:", e);
    res.status(500).json({ message: "Failed to create coupon" });
  }
});

// PATCH /api/coupons/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = couponUpdateSchema.parse(req.body);
    
    // If code is being updated, check for duplicates
    if (data.code) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: data.code }
      });
      
      if (existingCoupon && existingCoupon.id !== id) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
    }
    
    const coupon = await prisma.coupon.update({ 
      where: { id }, 
      data 
    });
    res.json(coupon);
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: e.errors 
      });
    }
    if (e.code === 'P2025') {
      return res.status(404).json({ message: "Coupon not found" });
    }
    console.error("Error updating coupon:", e);
    res.status(500).json({ message: "Failed to update coupon" });
  }
});

// DELETE /api/coupons/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.coupon.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    if (e.code === 'P2025') {
      return res.status(404).json({ message: "Coupon not found" });
    }
    console.error("Error deleting coupon:", e);
    res.status(500).json({ message: "Failed to delete coupon" });
  }
});

export default router;