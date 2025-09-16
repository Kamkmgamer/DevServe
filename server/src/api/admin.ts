import { Response } from "express";
import { db } from "../lib/db";
import { users, services, orders, cartItems } from "../lib/schema";
import { sql, eq } from "drizzle-orm";
import type { AuthRequest } from "../middleware/auth";

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    // Count users (excluding admin?), services, orders, and cart items
    const [userCount, serviceCount, orderCount, cartItemCount] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(services),
        db.select({ count: sql<number>`count(*)` }).from(orders),
        db.select({ count: sql<number>`count(*)` }).from(cartItems),
      ]);

    res.json({
      users: userCount[0].count,
      services: serviceCount[0].count,
      orders: orderCount[0].count,
      cartItems: cartItemCount[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load admin dashboard data" });
  }
};

// GET /admin/stats
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const userCount = userCountResult[0].count;

    const serviceCountResult = await db.select({ count: sql<number>`count(*)` }).from(services);
    const serviceCount = serviceCountResult[0].count;

    const orderCountResult = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const orderCount = orderCountResult[0].count;

    const cartItemCountResult = await db.select({ count: sql<number>`count(*)` }).from(cartItems);
    const cartItemCount = cartItemCountResult[0].count;

    res.json({
      users: userCount,
      services: serviceCount,
      orders: orderCount,
      cartItems: cartItemCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
};

// GET /admin/orders
export const getAdminOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orderResults = await db.select().from(orders);
    res.json(orderResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// PUT /admin/orders/:id
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  try {
    await db.update(orders).set({ status: newStatus }).where(eq(orders.id, id));
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// GET /admin/users
export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userResults = await db.select().from(users);
    res.json(userResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// POST /admin/users
export const createUser = async (req: AuthRequest, res: Response) => {
  const data = req.body;

  try {
    const insertResult = await db.insert(users).values(data).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });
    res.status(201).json(insertResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// PUT /admin/users/:id
export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updateResult = await db.update(users).set(data).where(eq(users.id, id)).returning();
    const updatedUser = updateResult[0];

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// DELETE /admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await db.delete(users).where(eq(users.id, id));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};