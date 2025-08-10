// server/src/routes/coupons.ts
import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { admin, protect } from "../middleware/auth";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    role: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/* Shared Zod schema                                                  */
/* ------------------------------------------------------------------ */
const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .transform((s: string) => s.toUpperCase()),
    type: z.enum(["percentage", "fixed"]),
    value: z.number().positive().int(),
    minOrderAmount: z.number().positive().int().optional().nullable(),
    maxUses: z.number().positive().int().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    active: z.boolean(),
  })
  .refine((d: { type: "percentage" | "fixed"; value: number }) =>
    (d.type === "percentage" ? d.value <= 100 : true), {
    path: ["value"],
    message: "Percentage value may not exceed 100",
  });

const formatZodError = (err: z.ZodError) =>
  err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));

/* ------------------------------------------------------------------ */
/* Public Routes (Before Auth Middleware)                             */
/* ------------------------------------------------------------------ */

/**
 * NEW: Public route to validate and fetch a coupon by its code.
 * This is used on the checkout page.
 */
router.get("/code/:code", async (req: AuthRequest, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    console.log('Coupon code received:', code);
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Server-side validation is crucial
    if (!coupon.active) {
      return res.status(400).json({ message: "This coupon is inactive" });
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired" });
    }
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ message: "This coupon has reached its usage limit" });
    }

    res.json(coupon);
  } catch (e) {
    console.error("Fetch coupon by code error", e);
    res.status(500).json({ message: "Failed to validate coupon" });
  }
});

router.get("/", async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 100;
  try {
    const [total, data] = await prisma.$transaction([
      prisma.coupon.count(),
      prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    res.json({ data, total, page, pageSize });
  } catch (e) {
    console.error("Fetch coupons error", e);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: req.params.id },
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  } catch (e) {
    console.error("Fetch coupon error", e);
    res.status(500).json({ message: "Failed to fetch coupon" });
  }
});

/* ------------------------------------------------------------------ */
/* Protected Admin Routes                                             */
/* ------------------------------------------------------------------ */
router.use(protect, admin);

router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = couponSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Validation failed", errors: formatZodError(parsed.error) });

  const data = parsed.data;
  try {
    const duplicate = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (duplicate) return res.status(400).json({ message: "Coupon code already exists" });

    const coupon = await prisma.coupon.create({ data: { ...data, currentUses: 0 } });
    res.status(201).json(coupon);
  } catch (e) {
    console.error("Create coupon error", e);
    res.status(500).json({ message: "Failed to create coupon" });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const parsed = couponSchema.partial().safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Validation failed", errors: formatZodError(parsed.error) });

  const data = parsed.data;
  try {
    if (data.code) {
      const dup = await prisma.coupon.findFirst({
        where: { code: data.code, NOT: { id: req.params.id } },
      });
      if (dup) return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data });
    res.json(coupon);
  } catch (e: any) {
    if (e.message?.includes("Record to update"))
      return res.status(404).json({ message: "Coupon not found" });
    console.error("Update coupon error", e);
    res.status(500).json({ message: "Failed to update coupon" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Coupon not found" });
  }
});

export default router;