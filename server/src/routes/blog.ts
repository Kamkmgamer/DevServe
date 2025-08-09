import { Router } from "express";
import {
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../api/blog";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getAllBlogPosts);
router.get("/:id", getBlogPostById);
router.post("/", protect, createBlogPost);
router.patch("/:id", protect, updateBlogPost);
router.delete("/:id", protect, deleteBlogPost);

export default router;