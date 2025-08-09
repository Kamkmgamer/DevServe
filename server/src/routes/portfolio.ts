import { Router } from "express";
import {
  getAllPortfolio,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../api/portfolio";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getAllPortfolio);
router.get("/:id", getPortfolioById);
router.post("/", protect, createPortfolio);
router.patch("/:id", protect, updatePortfolio);
router.delete("/:id", protect, deletePortfolio);

export default router;