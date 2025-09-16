// server/src/routes/orders.ts
import { Router, NextFunction } from "express";
import { db } from '../lib/db';
import { orders, coupons, referrals, commissions, cartItems, services, orderLineItems } from '../lib/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { AuthRequest } from '../middleware/auth';
import { protect } from "../middleware/auth"; // Changed from authMiddleware
import { validate } from "../middleware/validation";
import { createOrderSchema, idParamSchema, updateOrderStatusSchema } from "../lib/validation";
import { AppError } from "../lib/errors";

const router = Router();

router.use(protect); // Changed from authMiddleware

// GET /api/orders
router.get("/", async (req: AuthRequest, res, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(AppError.unauthorized("User not authenticated"));
    }
    // Get user orders
    const orderResults = await db.select().from(orders).where(eq(orders.userId, req.user.id));
    res.json(orderResults);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders
router.post("/", validate(createOrderSchema), async (req: AuthRequest, res, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(AppError.unauthorized("User not authenticated"));
    }
    const { items, requirements, discount, referralCode } = req.body;

    if (!items?.length) {
      return next(AppError.badRequest("No items provided"));
    }

    if (!requirements) {
      return next(AppError.badRequest("Requirements are required"));
    }

    let totalCents = 0;
    const lineData: any[] = [];

    // Validate all items and calculate total
    for (const item of items) {
      if (!item.serviceId || !item.quantity || item.quantity < 1) {
        return next(AppError.badRequest("Invalid item data"));
      }

      // Get service for price
      const serviceResult = await db.select().from(services).where(eq(services.id, item.serviceId));
      const service = serviceResult[0];

      if (!service) {
        return next(AppError.badRequest(`Service not found: ${item.serviceId}`));
      }

      const unitPrice = Math.round(service.price * 100);
      const itemTotal = unitPrice * item.quantity;
      totalCents += itemTotal;

      lineData.push({
        serviceId: item.serviceId,
        unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    let couponId: string | null = null;

    // Apply coupon if provided
    if (discount?.code) {
      // Get coupon
      const couponResult = await db.select().from(coupons).where(eq(coupons.code, discount.code.toUpperCase()));
      const coupon = couponResult[0];

      if (coupon && coupon.active) {
        const now = new Date();

        // Check if coupon is expired
        if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
          return next(AppError.badRequest("Coupon has expired"));
        }

        // Check max uses
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
          return next(AppError.badRequest("Coupon usage limit reached"));
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && totalCents < coupon.minOrderAmount) {
          return next(AppError.badRequest(
            `Minimum order amount is ${formatCurrency(coupon.minOrderAmount)}`
          ));
        }

        // Apply discount
        if (coupon.type === "percentage") {
          totalCents -= Math.round((totalCents * coupon.value) / 100);
        } else if (coupon.type === "fixed") {
          totalCents -= coupon.value;
        }

        // Ensure total doesn't go negative
        totalCents = Math.max(0, totalCents);
        couponId = coupon.id;

        // Increment coupon usage
        await db.update(coupons).set({ currentUses: sql`${coupons.currentUses} + 1` }).where(eq(coupons.id, coupon.id));
      } else {
        return next(AppError.badRequest("Invalid coupon code"));
      }
    }

    let referralId: string | null = null;
    if (referralCode) {
        const [referral] = await db.select().from(referrals).where(eq(referrals.code, referralCode));

        if (referral) {
            referralId = referral.id;
        } else {
            return next(AppError.badRequest("Invalid referral code"));
        }
    }

    // Create the order
    const orderData = {
      userId: req.user.id,
      totalAmount: totalCents,
      requirements: typeof requirements === 'string' ? requirements : JSON.stringify(requirements),
      couponId,
      referralId,
    };
    const orderResult = await db.insert(orders).values(orderData).returning();
    const newOrder = Array.isArray(orderResult) && orderResult.length > 0 ? orderResult[0] : null;
    if (!newOrder) {
      return next(AppError.internal("Failed to create order"));
    }

    // Create line items separately
    for (const item of lineData) {
      await db.insert(orderLineItems).values({
        orderId: newOrder.id,
        serviceId: item.serviceId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
    }

    if (referralId) {
      const referralResult = await db.select().from(referrals).where(eq(referrals.id, referralId));
      const referral = Array.isArray(referralResult) && referralResult.length > 0 ? referralResult[0] : null;
      if (referral && typeof referral.commissionRate === 'number') {
        const commissionAmount = Math.round(totalCents * referral.commissionRate);
        await db.insert(commissions).values({
          orderId: newOrder.id,
          referralId: referral.id,
          amount: commissionAmount,
        });
      }
    }

    // Clear user's cart
    if (req.user) {
      await db.delete(cartItems).where(eq(cartItems.cartId, req.user.id));
    }

    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

// Helper function to format currency
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// PATCH /api/orders/:id/status
router.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  async (req: AuthRequest, res, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(AppError.badRequest("Status is required"));
    }

    const order = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();

    res.json(order);
  } catch (error) {
    next(AppError.internal("Failed to update order status"));
  }
});

export default router;