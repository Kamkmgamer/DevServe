import { Request, Response } from "express";
import { db } from "../lib/db";
import { blogPosts } from "../lib/schema";
import { eq } from "drizzle-orm";

type BlogPost = typeof blogPosts.$inferSelect;

function hasRows<T>(val: unknown): val is { rows: T[] } {
  return typeof val === 'object' && val !== null && 'rows' in (val as Record<string, unknown>);
}

export const getAllBlogPosts = async (_req: Request, res: Response) => {
  // Get posts
  const allPosts = await db.select().from(blogPosts);
  res.json(allPosts);
};

export const getBlogPostById = async (req: Request, res: Response) => {
  const id = req.params.id;
  // Get post
  const raw = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  const postResult: BlogPost[] = hasRows<BlogPost>(raw) ? raw.rows : (raw as BlogPost[]);
  const post = postResult[0];

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(post);
};

export const createBlogPost = async (req: Request, res: Response) => {
  try {
    // Create post
    const raw = await db.insert(blogPosts).values(req.body).returning();
    const insertResult: BlogPost[] = hasRows<BlogPost>(raw) ? raw.rows : (raw as BlogPost[]);
    const newPost = insertResult[0];
    res.status(201).json(newPost);
  } catch {
    res.status(400).json({ error: "Failed to create" });
  }
};

export const updateBlogPost = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    // Update post
    const raw = await db.update(blogPosts).set(req.body).where(eq(blogPosts.id, id)).returning();
    const updateResult: BlogPost[] = hasRows<BlogPost>(raw) ? raw.rows : (raw as BlogPost[]);
    const updatedPost = updateResult[0];

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(updatedPost);
  } catch {
    res.status(400).json({ error: "Failed to update" });
  }
};

export const deleteBlogPost = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    // Delete post
    await db.delete(blogPosts).where(eq(blogPosts.id, id));

    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Failed to delete" });
  }
};