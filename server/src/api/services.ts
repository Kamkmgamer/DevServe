import { Request, Response } from "express";
import { db } from '../lib/db';
import { services } from '../lib/schema';
import { eq } from 'drizzle-orm';

type Service = typeof services.$inferSelect;

function hasRows<T>(val: unknown): val is { rows: T[] } {
  return typeof val === 'object' && val !== null && 'rows' in (val as any);
}

// GET /api/services
export const getAllServices = async (req: Request, res: Response) => {
  console.log("Attempting to get all services");
  try {
    const servicesList = await db.select().from(services);
    console.log("Successfully fetched services");
    res.json(servicesList);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// GET /api/services/:id
export const getServiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const raw = await db.select().from(services).where(eq(services.id, id)).limit(1);
  const result: Service[] = hasRows<Service>(raw) ? raw.rows : (raw as Service[]);
  const [service] = result;
  if (!service) return res.status(404).json({ error: "Not found" });
  res.json(service);
};

// POST /api/services (protected)
export const createService = async (req: Request, res: Response) => {
  try {
    const { features, imageUrls, ...rest } = req.body;
    
    const data = {
      ...rest,
      features: Array.isArray(features) ? JSON.stringify(features) : features,
      imageUrls: Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : imageUrls,
    };
    
    const raw = await db.insert(services).values(data).returning();
    const inserted: Service[] = hasRows<Service>(raw) ? raw.rows : (raw as Service[]);
    const [newService] = inserted;
    res.status(201).json(newService);
  } catch (e) {
    console.error(e); // Added this line
    res.status(400).json({ error: "Failed to create" });
  }
};

// PATCH /api/services/:id (protected)
export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { features, imageUrls, ...rest } = req.body;
    
    const data = {
      ...rest,
      ...(features && { features: Array.isArray(features) ? JSON.stringify(features) : features }),
      ...(imageUrls && { imageUrls: Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : imageUrls }),
    };
    
    const raw = await db.update(services).set(data).where(eq(services.id, id)).returning();
    const updated: Service[] = hasRows<Service>(raw) ? raw.rows : (raw as Service[]);
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Failed to update" });
  }
};

// DELETE /api/services/:id (protected)
export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.delete(services).where(eq(services.id, id));
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Failed to delete" });
  }
};