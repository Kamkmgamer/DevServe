import { Request, Response } from "express";
import { db } from '../lib/db';
import { portfolios } from '../lib/schema';
import { eq } from 'drizzle-orm';

type Portfolio = typeof portfolios.$inferSelect;

function hasRows<T>(val: unknown): val is { rows: T[] } {
  return typeof val === 'object' && val !== null && 'rows' in (val as any);
}

// GET /api/portfolio
export const getAllPortfolio = async (_req: Request, res: Response) => {
  const allItems = await db.select().from(portfolios);
  res.json(allItems);
};

// GET /api/portfolio/:id
export const getPortfolioById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const raw = await db.select().from(portfolios).where(eq(portfolios.id, id));
  const itemResult: Portfolio[] = hasRows<Portfolio>(raw) ? raw.rows : (raw as Portfolio[]);
  const item = itemResult[0];
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
};

// POST /api/portfolio (protected)
export const createPortfolio = async (req: Request, res: Response) => {
  try {
    const { imageUrls, ...rest } = req.body;
    
    const data = {
      ...rest,
      imageUrls: Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : imageUrls,
    };
    
    const raw = await db.insert(portfolios).values(data).returning();
    const insertResult: Portfolio[] = hasRows<Portfolio>(raw) ? raw.rows : (raw as Portfolio[]);
    const newItem = insertResult[0];
    res.status(201).json(newItem);
  } catch {
    res.status(400).json({ error: "Failed to create" });
  }
};

// PATCH /api/portfolio/:id (protected)
export const updatePortfolio = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const { imageUrls, ...rest } = req.body;
    
    const data = {
      ...rest,
      ...(imageUrls && { imageUrls: Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : imageUrls }),
    };
    
    const raw = await db.update(portfolios).set(data).where(eq(portfolios.id, id)).returning();
    const updateResult: Portfolio[] = hasRows<Portfolio>(raw) ? raw.rows : (raw as Portfolio[]);
    const updatedItem = updateResult[0];
    res.json(updatedItem);
  } catch {
    res.status(400).json({ error: "Failed to update" });
  }
};

// DELETE /api/portfolio/:id (protected)
export const deletePortfolio = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await db.delete(portfolios).where(eq(portfolios.id, id));
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Failed to delete" });
  }
};