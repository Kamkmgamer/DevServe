import { Router } from "express";
import {
  getAllPortfolio,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../api/portfolio";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", getAllPortfolio);
router.get("/:id", getPortfolioById);
router.post("/", authMiddleware, createPortfolio);
router.patch("/:id", authMiddleware, updatePortfolio);
router.delete("/:id", authMiddleware, deletePortfolio);

export default router;