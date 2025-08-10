import { Router } from "express";
import { registerAdmin, login, register, changePassword, requestPasswordReset, resetPassword } from "../api/auth";
import { validate } from "../middleware/validation";
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordRequestSchema, resetPasswordSchema } from "../lib/validation";
import { protect } from "../middleware/auth";

const router = Router();

// Public auth routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordRequestSchema), requestPasswordReset);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// Protected auth routes
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
