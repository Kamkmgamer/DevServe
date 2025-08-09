import { Router } from "express";
import { registerAdmin, login, register } from "../api/auth";
import { validate } from "../middleware/validation";
import { registerSchema, loginSchema } from "../lib/validation";

const router = Router();

// Public auth routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
