// server/src/routes/coupons.ts
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

// Fixed schema to match client
const couponSchema = z.object({
  code: z.string().min(1, "Code is required").trim().toUpperCase(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive().int().min(1, "Value must be at least 1 cent"),
  minOrderAmount: z.number().positive().int().min(100).optional().nullable(),
  maxUses: z.number().positive().int().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  active: z.boolean(),
});

// Format Zod errors properly
const formatZodError = (error: z.ZodError) => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
};

// GET /api/coupons/:id
router.get("/:id", async (req: Request, res: Response) => {
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
    res.status(500).json({ 
      message: "Failed to fetch coupon",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.use(require("../middleware/auth").authMiddleware);

// GET /api/coupons
router.get("/", async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ 
      message: "Failed to fetch coupons",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/coupons
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("Creating coupon with data:", req.body);
    
    const validation = couponSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: formatZodError(validation.error)
      });
    }

    const data = validation.data;
    
    // Check for duplicate code
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code }
    });
    
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    
    const coupon = await prisma.coupon.create({ 
      data: {
        ...data,
        currentUses: 0
      }
    });
    
    res.status(201).json(coupon);
    
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ 
      message: "Failed to create coupon",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// PATCH /api/coupons/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const validation = couponSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: formatZodError(validation.error)
      });
    }

    const data = validation.data;
    
    if (data.code) {
      const existing = await prisma.coupon.findFirst({
        where: { 
          code: data.code,
          NOT: { id: req.params.id }
        }
      });
      
      if (existing) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
    }
    
    const coupon = await prisma.coupon.update({ 
      where: { id: req.params.id }, 
      data 
    });
    
    res.json(coupon);
    
  } catch (error) {
    console.error("Error updating coupon:", error);
    if (error instanceof Error && error.message.includes("Record to update")) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(500).json({ 
      message: "Failed to update coupon",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;