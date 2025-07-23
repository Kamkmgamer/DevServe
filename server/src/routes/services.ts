import { Router } from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../api/services";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.post("/", authMiddleware, createService);
router.patch("/:id", authMiddleware, updateService);
router.delete("/:id", authMiddleware, deleteService);

export default router;