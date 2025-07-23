import { Router } from "express";
import { registerAdmin, login } from "../api/auth";

const router = Router();

// Admin registration (you may disable this in production)
router.post("/register", registerAdmin);

// Admin login → returns a JWT
router.post("/login", login);

export default router;