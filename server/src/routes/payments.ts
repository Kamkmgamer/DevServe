 import { Router } from "express";
 import { createCheckoutSession, createPaypalOrder, capturePaypalOrder } from "../api/payments";
 import { validate } from "../middleware/validation";
 import { createCheckoutSessionSchema, createPaypalOrderSchema, capturePaypalOrderSchema } from "../lib/validation";

const router = Router();

 router.post("/create-checkout-session", validate(createCheckoutSessionSchema), createCheckoutSession);
 router.post("/paypal/create", validate(createPaypalOrderSchema), createPaypalOrder);
 router.post("/paypal/capture", validate(capturePaypalOrderSchema), capturePaypalOrder);

export default router;
