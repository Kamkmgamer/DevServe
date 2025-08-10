import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /api/services
export const getAllServices = async (req: Request, res: Response) => {
  console.log("Attempting to get all services");
  try {
    const services = await prisma.service.findMany();
    console.log("Successfully fetched services");
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// GET /api/services/:id
export const getServiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const service = await prisma.service.findUnique({ where: { id } });
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
    
    const service = await prisma.service.create({ data });
    res.status(201).json(service);
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
    
    const service = await prisma.service.update({
      where: { id },
      data,
    });
    res.json(service);
  } catch (e) {
    res.status(400).json({ error: "Failed to update" });
  }
};

// DELETE /api/services/:id (protected)
export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete" });
  }
};