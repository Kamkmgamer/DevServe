import { Router } from "express";
import { protect } from "../middleware/auth";
import { addToCart, getCart, removeFromCart } from "../api/cart";
import { validate } from "../middleware/validation";
import { addToCartSchema, cartItemParamSchema } from "../lib/validation";

const router = Router();

// All cart routes are protected
router.use(protect);

router.get("/", getCart);
router.post("/items", validate(addToCartSchema), addToCart);
router.delete("/items/:itemId", validate({ params: cartItemParamSchema }), removeFromCart);

export default router;
