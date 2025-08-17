import { Router } from "express";
import prisma from "../lib/prisma";
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
  const [userCount, serviceCount, orderCount, cartItemCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.order.count(),
      prisma.cartItem.count(),
    ]);
  try {
    res.json({ userCount, serviceCount, orderCount, cartItemCount });
  } catch (err) {
    next(err);
  }
});

// NEW route – matches the AdminOrdersPage fetch
router.get("/orders", async (_req, res, next) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true } },
      lineItems: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  try {
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

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// User Management Routes

// GET all users
router.get("/users", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET single user by ID
router.get("/users/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      return next(AppError.notFound("User not found"));
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST create new user
router.post("/users", validate(adminCreateUserSchema), async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) {
      return next(AppError.badRequest("Email and password are required"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || "USER" },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === 'P2002') { // Unique constraint failed for email
      return next(AppError.conflict("User with this email already exists"));
    }
    next(error);
  }
});

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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    res.json(updatedUser);
  } catch (error: any) {
    if (error.code === 'P2002') { // Unique constraint failed for email
      return next(AppError.conflict("User with this email already exists"));
    }
    next(error);
  }
});

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

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return next(AppError.notFound("User not found."));
    }

    // Only SUPERADMIN can delete ADMIN users
    if (targetUser.role === "ADMIN" && requestingUser.role !== "SUPERADMIN") {
      return next(AppError.forbidden("Only superadmins can delete admin accounts."));
    }

    await prisma.user.delete({
      where: { id },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
});

export default router;