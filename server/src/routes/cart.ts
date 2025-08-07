import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { addToCart, getCart, removeFromCart } from "../api/cart";
import { validate } from "../middleware/validation";
import { addToCartSchema } from "../lib/validation";

const router = Router();

// All cart routes are protected
router.use(authMiddleware);

router.get("/", getCart);
router.post("/items", validate(addToCartSchema), addToCart);
router.delete("/items/:itemId", removeFromCart);

export default router;
