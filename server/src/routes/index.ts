// src/routes/index.ts (UPDATED)
import { Router } from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import serviceRoutes from "./services";
import cartRoutes from "./cart";
import contactRoutes from "./contact";
import portfolioRoutes from "./portfolio";
import blogRoutes from "./blog";
import ordersRoutes from "./orders";
import couponsRoutes from "./coupons";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/services", serviceRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/blog", blogRoutes);
router.use("/cart", cartRoutes);
router.use("/contact", contactRoutes);
router.use("/orders", ordersRoutes);
router.use("/coupons", couponsRoutes);
router.use("/payments", paymentsRoutes); 

export default router;