import { Router } from "express";
import { registerAdmin, login } from "../api/auth";
import { validate } from "../middleware/validation";
import { registerSchema, loginSchema } from "../lib/validation";

const router = Router();

// Admin registration (you may disable this in production)
router.post("/register", validate(registerSchema), registerAdmin);

// Admin login → returns a JWT
router.post("/login", validate(loginSchema), login);

export default router;
