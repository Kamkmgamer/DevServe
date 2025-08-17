// server/src/routes/coupons.ts
import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { admin, protect, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  couponSchema,
  couponUpdateSchema,
  couponCodeParamSchema,
  paginationQuerySchema,
  idParamSchema,
} from "../lib/validation";

const router = Router();

/* ------------------------------------------------------------------ */
/* Validation uses centralized schemas via validate() middleware       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Public Routes (Before Auth Middleware)                             */
/* ------------------------------------------------------------------ */

/**
 * NEW: Public route to validate and fetch a coupon by its code.
 * This is used on the checkout page.
 */
router.get("/code/:code", validate({ params: couponCodeParamSchema }), async (req: AuthRequest, res: Response) => {
  try {
    const code = req.params.code;
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

router.get("/", validate({ query: paginationQuerySchema }), async (req: AuthRequest, res: Response) => {
  const { page = 1, pageSize = 100 } = (req.query as any) || {};
  try {
    // Small retry wrapper for transient SQLite lock errors during tests
    const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 50): Promise<T> => {
      let lastErr: any;
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (e: any) {
          const msg = e?.message || '';
          // sqlite lock indicators
          if (msg.includes('database is locked') || msg.includes('SQLITE_BUSY')) {
            lastErr = e;
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }
          throw e;
        }
      }
      throw lastErr;
    };

    // Run sequentially to avoid potential SQLite locking with concurrent tx
    const total = await withRetry(() => prisma.coupon.count());
    const data = await withRetry(() =>
      prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    );
    res.json({ data, total, page, pageSize });
  } catch (e) {
    console.error("Fetch coupons error", e);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

router.get("/:id", validate({ params: idParamSchema }), async (req: AuthRequest, res: Response) => {
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

router.post("/", validate(couponSchema), async (req: AuthRequest, res: Response) => {
  const data = req.body;
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

router.patch(
  "/:id",
  validate({ params: idParamSchema, body: couponUpdateSchema }),
  async (req: AuthRequest, res: Response) => {
  const data = req.body;
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

router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  async (req: AuthRequest, res: Response) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Coupon not found" });
  }
});

export default router;