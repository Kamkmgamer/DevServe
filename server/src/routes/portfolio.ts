 import { Router } from "express";
 import {
  getAllPortfolio,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../api/portfolio";
 import { protect } from "../middleware/auth";
 import { validate } from "../middleware/validation";
 import { idParamSchema, createPortfolioSchema, updatePortfolioSchema } from "../lib/validation";

const router = Router();

router.get("/", getAllPortfolio);
 router.get("/:id", validate({ params: idParamSchema }), getPortfolioById);
 router.post("/", protect, validate(createPortfolioSchema), createPortfolio);
 router.patch("/:id", protect, validate({ params: idParamSchema, body: updatePortfolioSchema }), updatePortfolio);
 router.delete("/:id", protect, validate({ params: idParamSchema }), deletePortfolio);

export default router;