import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { addToCart, getCart, removeFromCart } from "../api/cart";

const router = Router();

// All cart routes are protected
router.use(authMiddleware);

router.get("/", getCart);
router.post("/items", addToCart);
router.delete("/items/:itemId", removeFromCart);

export default router;