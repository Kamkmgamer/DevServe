import { Router } from "express";
import { db } from "../lib/db";
import { users, services, orders, cartItems } from "../lib/schema";
import { sql, eq } from "drizzle-orm";
import { protect, admin, superadmin, AuthRequest } from "../middleware/auth"; // Import protect, admin, superadmin, and AuthRequest
import bcrypt from "bcryptjs";
import { validate } from "../middleware/validation";
import { AppError } from "../lib/errors";
import {
  idParamSchema,
  updateOrderStatusSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
} from "../lib/validation";

const router = Router();
router.use(protect); // Use protect middleware for all admin routes
router.use(admin); // Use admin middleware for all admin routes

// Dashboard stats (unchanged)
router.get("/", async (_req, res, next) => {
  try {
    // Stats
    const userCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const userCount = userCountResult[0].count;

    const serviceCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(services);
    const serviceCount = serviceCountResult[0].count;

    const orderCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    const orderCount = orderCountResult[0].count;

    const cartItemCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cartItems);
    const cartItemCount = cartItemCountResult[0].count;

    res.json({ userCount, serviceCount, orderCount, cartItemCount });
  } catch (err) {
    next(err);
  }
});

// NEW route – matches the AdminOrdersPage fetch
router.get("/orders", async (_req, res, next) => {
  try {
    // Get orders
    const orderResults = await db.select().from(orders);
    res.json(orderResults);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/orders/:id/status
router.patch(
  "/orders/:id/status",
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return next(AppError.badRequest("Status is required"));
      }

      // Update order
      await db.update(orders)
        .set({ status })
        .where(eq(orders.id, id));

      res.json({ id, status });
    } catch (error) {
      next(error);
    }
  }
);

// User Management Routes

// GET all users
router.get("/users", async (_req, res, next) => {
  try {
    // Get users
    const userResults = await db.select().from(users);
    res.json(userResults);
  } catch (error) {
    next(error);
  }
});

// GET single user by ID
router.get(
  "/users/:id",
  validate({ params: idParamSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
      if (!user || user.length === 0) {
        return next(AppError.notFound("User not found"));
      }
      res.json(user[0]);
    } catch (error) {
      next(error);
    }
  }
);

// POST create new user
router.post(
  "/users",
  validate(adminCreateUserSchema),
  async (req, res, next) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password) {
        return next(AppError.badRequest("Email and password are required"));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await db
        .insert(users)
        .values({ email, password: hashedPassword, name, role: role || "USER" })
        .returning();
      res.status(201).json(newUser);
    } catch (error: any) {
      if (error.code === "P2002") {
        // Unique constraint failed for email
        return next(AppError.conflict("User with this email already exists"));
      }
      next(error);
    }
  }
);

// PUT update user
router.put(
  "/users/:id",
  validate({ params: idParamSchema, body: adminUpdateUserSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email, password, name, role } = req.body;

      const updateData: any = { name, role };
      if (email) {
        updateData.email = email;
      }
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      res.json(updatedUser);
    } catch (error: any) {
      if (error.code === "P2002") {
        // Unique constraint failed for email
        return next(AppError.conflict("User with this email already exists"));
      }
      next(error);
    }
  }
);

// DELETE user
router.delete(
  "/users/:id",
  superadmin,
  validate({ params: idParamSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const requestingUser = req.user; // User making the request (from protect middleware)

      if (!requestingUser) {
        return next(AppError.unauthorized("Not authenticated."));
      }

      // Prevent self-deletion
      if (requestingUser.id === id) {
        return next(AppError.forbidden("You cannot delete your own account."));
      }

      const targetUser = await db
        .select()
        .from(users)
        .where(eq(users.id, id));

      if (!targetUser || targetUser.length === 0) {
        return next(AppError.notFound("User not found."));
      }

      const targetUserObj = targetUser[0];

      // Only SUPERADMIN can delete ADMIN users
      if (targetUserObj.role === "ADMIN" && requestingUser.role !== "SUPERADMIN") {
        return next(AppError.forbidden("Only superadmins can delete admin accounts."));
      }

      await db.delete(users).where(eq(users.id, id));
      res.status(204).send(); // No Content
    } catch (error) {
      next(error);
    }
  }
);

export default router;