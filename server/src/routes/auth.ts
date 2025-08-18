import { Router } from "express";
import { registerAdmin, login, register, changePassword, requestPasswordReset, resetPassword, logout, csrfToken, refresh } from "../api/auth";
import { validate } from "../middleware/validation";
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordRequestSchema, resetPasswordSchema } from "../lib/validation";
import { protect } from "../middleware/auth";
import { sensitiveLimiter, authBurstLimiter } from "../middleware/rateLimit";

const router = Router();

// Public auth routes (stack burst limiter with sensitiveLimiter)
router.post("/register", authBurstLimiter, sensitiveLimiter, validate(registerSchema), register);
router.post("/login", authBurstLimiter, sensitiveLimiter, validate(loginSchema), login);
router.post("/forgot-password", authBurstLimiter, sensitiveLimiter, validate(forgotPasswordRequestSchema), requestPasswordReset);
router.post("/reset-password", authBurstLimiter, sensitiveLimiter, validate(resetPasswordSchema), resetPassword);
router.get("/csrf-token", csrfToken);
router.post("/logout", logout);
router.post("/refresh", refresh);

// Protected auth routes
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
