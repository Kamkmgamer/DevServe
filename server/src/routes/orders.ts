// server/src/routes/orders.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ------------------------------------------------------------------
// Helper type so every handler knows req.userId is available
// ------------------------------------------------------------------
type Req = AuthRequest;

// ------------------------------------------------------------------
// GET /api/orders
// Returns the currently logged-in user’s orders
// ------------------------------------------------------------------
router.get("/", async (req: Req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: {
      lineItems: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// ------------------------------------------------------------------
// POST /api/orders
// Creates an order from the user’s cart
// ------------------------------------------------------------------
router.post("/", async (req: Req, res) => {
  const { items, requirements, discount } = req.body;
  if (!items?.length)
    return res.status(400).json({ message: "No items provided" });

  let totalCents = 0;
  const lineData: any[] = [];

  for (const it of items) {
    const service = await prisma.service.findUnique({
      where: { id: it.serviceId },
    });
    if (!service)
      return res.status(400).json({ message: "Invalid service ID" });

    const unitPrice = Math.round(service.price * 100);
    totalCents += unitPrice * it.quantity;

    lineData.push({
      serviceId: it.serviceId,
      unitPrice,
      quantity: it.quantity,
      totalPrice: unitPrice * it.quantity,
    });
  }

  // Apply coupon if provided
  let couponId: string | undefined;
  if (discount?.code) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: discount.code.toUpperCase() },
    });
    if (coupon && coupon.active) {
      if (coupon.type === "percentage") {
        totalCents -= (totalCents * coupon.value) / 100;
      } else if (coupon.type === "fixed") {
        totalCents -= coupon.value;
      }
      couponId = coupon.id;
    }
  }
  if (totalCents < 0) totalCents = 0;

  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      totalAmount: totalCents,
      requirements,
      couponId,
      lineItems: { create: lineData },
    },
  });

  // Clear user’s cart
  await prisma.cartItem.deleteMany({
    where: { cart: { userId: req.userId } },
  });

  res.status(201).json(order);
});

// ------------------------------------------------------------------
// GET /api/orders/admin
// Admin-only: returns every order in the system
// ------------------------------------------------------------------
router.get("/admin", async (_req: Req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true } },
      lineItems: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    orders.map((o) => ({
      ...o,
      email: o.user.email,
    }))
  );
});

// ------------------------------------------------------------------
// PATCH /api/orders/:id/status
// Admin-only: update order status
// ------------------------------------------------------------------
router.patch("/:id/status", async (req: Req, res) => {
  const { status } = req.body;
  await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json({ message: "Status updated" });
});

// ------------------------------------------------------------------
// POST /api/orders/:id/authorize
// PayPal authorization callback
// ------------------------------------------------------------------
router.post("/:id/authorize", async (req: Req, res) => {
  await prisma.order.update({
    where: { id: req.params.id },
    data: { status: "PAID" },
  });
  res.json({ message: "Payment authorized" });
});

export default router;