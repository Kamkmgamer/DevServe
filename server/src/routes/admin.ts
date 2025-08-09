import { Router } from "express";
import prisma from "../lib/prisma";
import { protect, admin } from "../middleware/auth"; // Import protect and admin

const router = Router();
router.use(protect); // Use protect middleware for all admin routes
router.use(admin); // Use admin middleware for all admin routes

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

// PATCH /api/admin/orders/:id/status
router.patch("/orders/:id/status", async (req, res) => {
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