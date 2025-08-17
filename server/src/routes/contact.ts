import { Router } from "express";
import { handleContactForm } from "../api/contact";
import { validate } from "../middleware/validation";
import { contactSchema } from "../lib/validation";

const router = Router();

// Public contact form endpoint with validation
router.post("/", validate(contactSchema), handleContactForm);

export default router;