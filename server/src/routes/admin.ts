import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getAdminDashboard } from "../api/admin";

const router = Router();

// Protect all admin routes
router.use(authMiddleware);

// GET /api/admin → dashboard stats
router.get("/", getAdminDashboard);

export default router;