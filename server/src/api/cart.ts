import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// GET /api/cart - Get the current user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
  console.log("Attempting to get cart for user:", req.userId);
  try {
    const userId = req.userId!;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            service: true, // Include the full service details for each cart item
          },
        },
      },
    });
    console.log("Successfully fetched cart for user:", req.userId);
    res.json(cart);
  } catch (error) {
    console.error("Error fetching cart for user:", req.userId, error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// POST /api/cart/items - Add an item to the cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { serviceId, quantity } = req.body;

  // Find or create a cart for the user
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // Check if the item already exists in the cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, serviceId },
  });

  if (existingItem) {
    // If it exists, update the quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
    return res.json(updatedItem);
  } else {
    // If not, create a new cart item
    const newItem = await prisma.cartItem.create({
      data: { cartId: cart.id, serviceId, quantity },
    });
    return res.status(201).json(newItem);
  }
};

// DELETE /api/cart/items/:itemId - Remove an item from the cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { itemId } = req.params;

  // Verify the item belongs to the user's cart before deleting
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
  });

  if (!item) {
    return res.status(404).json({ error: "Item not found in your cart." });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  res.status(204).send();
};