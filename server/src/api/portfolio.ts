import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /api/portfolio
export const getAllPortfolio = async (_req: Request, res: Response) => {
  const items = await prisma.portfolioItem.findMany();
  res.json(items);
};

// GET /api/portfolio/:id
export const getPortfolioById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const item = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
};

// POST /api/portfolio (protected)
export const createPortfolio = async (req: Request, res: Response) => {
  try {
    const item = await prisma.portfolioItem.create({ data: req.body });
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: "Failed to create" });
  }
};

// PATCH /api/portfolio/:id (protected)
export const updatePortfolio = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const item = await prisma.portfolioItem.update({
      where: { id },
      data: req.body,
    });
    res.json(item);
  } catch {
    res.status(400).json({ error: "Failed to update" });
  }
};

// DELETE /api/portfolio/:id (protected)
export const deletePortfolio = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.portfolioItem.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Failed to delete" });
  }
};