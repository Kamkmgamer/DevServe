import { Router } from "express";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import serviceRoutes from "./services";
import cartRoutes from "./cart";
import contactRoutes from "./contact";
import portfolioRoutes from "./portfolio";
import blogRoutes from "./blog";


const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/services", serviceRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/blog", blogRoutes);
router.use("/cart", cartRoutes);
router.use("/contact", contactRoutes);

export default router;