import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /api/services
export const getAllServices = async (req: Request, res: Response) => {
  const services = await prisma.service.findMany();
  res.json(services);
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
    const service = await prisma.service.create({ data: req.body });
    res.status(201).json(service);
  } catch (e) {
    res.status(400).json({ error: "Failed to create" });
  }
};

// PATCH /api/services/:id (protected)
export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.update({
      where: { id },
      data: req.body,
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