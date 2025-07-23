import { Router } from "express";
import {
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../api/blog";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", getAllBlogPosts);
router.get("/:id", getBlogPostById);
router.post("/", authMiddleware, createBlogPost);
router.patch("/:id", authMiddleware, updateBlogPost);
router.delete("/:id", authMiddleware, deleteBlogPost);

export default router;