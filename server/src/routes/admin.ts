import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// Dashboard stats (unchanged)
router.get("/", async (_req, res) => {
  const [userCount, serviceCount, orderCount, cartItemCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.order.count(),
      prisma.cartItem.count(),
    ]);
  res.json({ userCount, serviceCount, orderCount, cartItemCount });
});

// NEW route – matches the AdminOrdersPage fetch
router.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true } },
      lineItems: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(
    orders.map((o) => ({
      id: o.id,
      email: o.user.email,
      total: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
      lineItems: o.lineItems,
    }))
  );
});

export default router;