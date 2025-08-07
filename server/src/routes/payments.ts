import { Router } from "express";
import { createCheckoutSession, createPaypalOrder, capturePaypalOrder } from "../api/payments";

const router = Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/paypal/create-order", createPaypalOrder);
router.post("/paypal/capture-order", capturePaypalOrder);

export default router;
