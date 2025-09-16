// server/src/routes/coupons.ts
import { Router, Request, Response, NextFunction } from "express";
import { db } from "../lib/db";
import { coupons } from "../lib/schema";
import type { InferSelectModel } from 'drizzle-orm';
import { eq, sql, ne, and } from "drizzle-orm";
import { admin, protect, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { AppError } from "../lib/errors";
import {
  couponSchema,
  couponUpdateSchema,
  couponCodeParamSchema,
  paginationQuerySchema,
  idParamSchema,
} from "../lib/validation";

type Coupon = InferSelectModel<typeof coupons>;

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
router.get("/code/:code", validate({ params: couponCodeParamSchema }), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const code = req.params.code;
    console.log('Coupon code received:', code);
    const couponResult = await db.select().from(coupons).where(eq(coupons.code, code));
    const coupon = couponResult[0];

    if (!coupon) {
      return next(AppError.notFound("Invalid coupon code"));
    }

    // Server-side validation is crucial
    if (!coupon.active) {
      return next(AppError.badRequest("This coupon is inactive"));
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return next(AppError.badRequest("This coupon has expired"));
    }
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return next(AppError.badRequest("This coupon has reached its usage limit"));
    }

    res.json(coupon);
  } catch (e) {
    next(e);
  }
});

router.get("/", validate({ query: paginationQuerySchema }), async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(coupons);
    const total = totalResult[0].count;
    const data = await withRetry(() =>
      db.select().from(coupons).orderBy(coupons.createdAt.desc()).offset((page - 1) * pageSize).limit(pageSize)
    );
    res.json({ data, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", validate({ params: idParamSchema }), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const couponResult = await db.select().from(coupons).where(eq(coupons.id, req.params.id));
    const coupon = couponResult[0];
    if (!coupon) return next(AppError.notFound("Coupon not found"));
    res.json(coupon);
  } catch (e) {
    next(e);
  }
});

/* ------------------------------------------------------------------ */
/* Protected Admin Routes                                             */
/* ------------------------------------------------------------------ */
router.use(protect, admin);

router.post("/", validate(couponSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = req.body;
  try {
    const duplicate = await db.select().from(coupons).where(eq(coupons.code, data.code));
    if (duplicate.length > 0) return next(AppError.conflict("Coupon code already exists"));

    const insertResult = await db.insert(coupons).values(data).returning();
    const newCoupon = (insertResult as Coupon[])[0];

    res.status(201).json(newCoupon);
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/:id",
  validate({ params: idParamSchema, body: couponUpdateSchema }),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = req.body;
  try {
    if (data.code) {
      const dup = await db.select().from(coupons)
        .where(and(eq(coupons.code, data.code), ne(coupons.id, req.params.id)));
      if (dup.length > 0) return next(AppError.conflict("Coupon code already exists"));
    }

    const updateResult = await db.update(coupons).set(data).where(eq(coupons.id, req.params.id)).returning();
    const updatedCoupon = (updateResult as Coupon[])[0];

    res.json(updatedCoupon);
  } catch (e: any) {
    if (e.message?.includes("Record to update"))
      return next(AppError.notFound("Coupon not found"));
    next(e);
  }
});

router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await db.delete(coupons).where(eq(coupons.id, req.params.id));
    res.status(204).send();
  } catch (e: any) {
    return next(AppError.notFound("Coupon not found"));
  }
});

export default router;