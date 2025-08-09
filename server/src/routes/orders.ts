// server/src/routes/orders.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { createOrderSchema } from "../lib/validation";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

type Req = AuthRequest;

// GET /api/orders
router.get("/", async (req: Req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        lineItems: {
          include: {
            service: true
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// POST /api/orders
router.post("/", validate(createOrderSchema), async (req: Req, res) => {
  try {
    const { items, requirements, discount, referralCode } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    if (!requirements) {
      return res.status(400).json({ message: "Requirements are required" });
    }

    let totalCents = 0;
    const lineData: any[] = [];

    // Validate all items and calculate total
    for (const item of items) {
      if (!item.serviceId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: "Invalid item data" });
      }

      const service = await prisma.service.findUnique({
        where: { id: item.serviceId },
      });

      if (!service) {
        return res.status(400).json({ message: `Service not found: ${item.serviceId}` });
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
      const coupon = await prisma.coupon.findUnique({
        where: { code: discount.code.toUpperCase() },
      });

      if (coupon && coupon.active) {
        const now = new Date();

        // Check if coupon is expired
        if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
          return res.status(400).json({ message: "Coupon has expired" });
        }

        // Check max uses
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
          return res.status(400).json({ message: "Coupon usage limit reached" });
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && totalCents < coupon.minOrderAmount) {
          return res.status(400).json({
            message: `Minimum order amount is ${formatCurrency(coupon.minOrderAmount)}`
          });
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
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { currentUses: { increment: 1 } },
        });
      } else {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
    }

    let referralId: string | null = null;
    if (referralCode) {
        const referral = await prisma.referral.findUnique({
            where: { code: referralCode },
        });

        if (referral) {
            referralId = referral.id;
        } else {
            return res.status(400).json({ message: "Invalid referral code" });
        }
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: req.userId!,
        totalAmount: totalCents,
        requirements: typeof requirements === 'string' ? requirements : JSON.stringify(requirements),
        couponId,
        referralId,
        lineItems: { create: lineData },
      },
    });

    if (referralId) {
        const referral = await prisma.referral.findUnique({ where: { id: referralId } });
        if (referral) {
            const commissionAmount = Math.round(totalCents * referral.commissionRate);
            await prisma.commission.create({
                data: {
                    orderId: order.id,
                    referralId: referral.id,
                    amount: commissionAmount,
                },
            });
        }
    }

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: req.userId } },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Helper function to format currency
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req: Req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default router;