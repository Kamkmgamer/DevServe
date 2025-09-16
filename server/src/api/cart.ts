import { Response } from "express";
import { db } from "../lib/db";
import { carts, cartItems } from "../lib/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";

type Cart = typeof carts.$inferSelect;
type CartItem = typeof cartItems.$inferSelect;

// GET /api/cart - Get the current user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cartResult = await db.select().from(carts).where(eq(carts.userId, userId)) as Cart[];
    const cart = cartResult[0];
    console.log("Successfully fetched cart for user:", userId);
    res.json(cart || { items: [], total: 0 });
  } catch (error) {
    console.error("Error fetching cart for user:", req.user!.id, error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// POST /api/cart/items - Add an item to the cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { serviceId, quantity = 1 } = req.body;

  // Find or create a cart for the user
  const cartResult = await db.select().from(carts).where(eq(carts.userId, userId)) as Cart[];
  let cart = cartResult[0];
  // If no cart, create
  if (!cart) {
    const newCartResult = await db.insert(carts).values({ userId }).returning() as Cart[];
    cart = newCartResult[0];
  }

  // Check if the item already exists in the cart
  const existingItemResult = await db.select().from(cartItems).where(and(
    eq(cartItems.cartId, cart.id),
    eq(cartItems.serviceId, serviceId)
  )) as CartItem[];
  const existingItem = existingItemResult[0];

  if (existingItem) {
    // If it exists, update the quantity
    await db.update(cartItems).set({ quantity: existingItem.quantity + quantity }).where(eq(cartItems.id, existingItem.id));
    return res.json(existingItem);
  } else {
    // If not, create a new cart item
    const newItemResult = await db.insert(cartItems).values({
      cartId: cart.id,
      serviceId,
      quantity,
    }).returning() as CartItem[];
    return res.status(201).json(newItemResult[0]);
  }
};

// DELETE /api/cart/items/:itemId - Remove an item from the cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;

  // Verify the item belongs to the user's cart before deleting
  const itemResult = await db.select().from(cartItems).where(eq(cartItems.id, parseInt(itemId))) as CartItem[];
  const item = itemResult[0];

  if (!item) {
    return res.status(404).json({ error: "Item not found in your cart." });
  }

  // Check ownership
  const cartResult = await db.select().from(carts).where(eq(carts.id, item.cartId)) as Cart[];
  const userCart = cartResult[0];
  if (!userCart || userCart.userId !== userId) {
    return res.status(403).json({ error: "Item does not belong to your cart." });
  }

  await db.delete(cartItems).where(eq(cartItems.id, parseInt(itemId)));
  res.status(204).send();
};