 import { Router } from "express";
 import {
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../api/blog";
 import { protect } from "../middleware/auth";
 import { validate } from "../middleware/validation";
 import { idParamSchema, createBlogPostSchema, updateBlogPostSchema } from "../lib/validation";

const router = Router();

router.get("/", getAllBlogPosts);
 router.get("/:id", validate({ params: idParamSchema }), getBlogPostById);
 router.post("/", protect, validate(createBlogPostSchema), createBlogPost);
 router.patch("/:id", protect, validate({ params: idParamSchema, body: updateBlogPostSchema }), updateBlogPost);
 router.delete("/:id", protect, validate({ params: idParamSchema }), deleteBlogPost);

export default router;