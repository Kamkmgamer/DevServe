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
import paymentsRoutes from "./payments";
import referralRoutes from "./referral";
import commissionRoutes from "./commissions";
import payoutRoutes from "./payouts";

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
router.use("/referrals", referralRoutes);
router.use("/commissions", commissionRoutes);
router.use("/payouts", payoutRoutes); 

export default router;