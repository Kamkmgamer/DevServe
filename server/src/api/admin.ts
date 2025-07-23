import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    // Count users (excluding admin?), services, orders, and cart items
    const [userCount, serviceCount, orderCount, cartItemCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.service.count(),
        prisma.order.count(),
        prisma.cartItem.count(),
      ]);

    res.json({
      userCount,
      serviceCount,
      orderCount,
      cartItemCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load admin dashboard data" });
  }
};