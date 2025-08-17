import { Router } from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../api/services";
import { protect } from "../middleware/auth"; // Changed from authMiddleware
import { validate } from "../middleware/validation";
import { createServiceSchema, updateServiceSchema, idParamSchema } from "../lib/validation";

const router = Router();

router.get("/", getAllServices);
router.get("/:id", validate({ params: idParamSchema }), getServiceById);
router.post("/", protect, validate(createServiceSchema), createService);
router.patch(
  "/:id",
  protect,
  validate({ params: idParamSchema, body: updateServiceSchema }),
  updateService
);
router.delete(
  "/:id",
  protect,
  validate({ params: idParamSchema }),
  deleteService
);

export default router;