import { Router } from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../api/services";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { createServiceSchema, updateServiceSchema } from "../lib/validation";

const router = Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.post("/", authMiddleware, validate(createServiceSchema), createService);
router.patch("/:id", authMiddleware, validate(updateServiceSchema), updateService);
router.delete("/:id", authMiddleware, deleteService);

export default router;
