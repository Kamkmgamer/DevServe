import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getAllBlogPosts = async (_req: Request, res: Response) => {
  const posts = await prisma.blogPost.findMany();
  res.json(posts);
};

export const getBlogPostById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: "Not found" });
  res.json(post);
};

export const createBlogPost = async (req: Request, res: Response) => {
  try {
    const post = await prisma.blogPost.create({ data: req.body });
    res.status(201).json(post);
  } catch {
    res.status(400).json({ error: "Failed to create" });
  }
};

export const updateBlogPost = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: req.body,
    });
    res.json(post);
  } catch {
    res.status(400).json({ error: "Failed to update" });
  }
};

export const deleteBlogPost = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.blogPost.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Failed to delete" });
  }
};