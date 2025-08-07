import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Service schemas
export const createServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  features: z.array(z.string()),
  category: z.string(),
  thumbnailUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// Cart schemas
export const addToCartSchema = z.object({
  serviceId: z.string(),
  quantity: z.number().int().positive().optional(),
});

// Order schemas
export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      serviceId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  requirements: z.record(z.string(), z.unknown()),
  discount: z.number().optional(),
});