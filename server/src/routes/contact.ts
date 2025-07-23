import { Router } from "express";
import { handleContactForm } from "../api/contact";

const router = Router();

// Public contact form endpoint
router.post("/", handleContactForm);

export default router;