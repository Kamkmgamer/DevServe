import { z } from 'zod';

// Regex for strong password: at least one uppercase, one lowercase, one number, one special character, min 8 chars
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().regex(strongPasswordRegex, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().regex(strongPasswordRegex, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().regex(strongPasswordRegex, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

// Service schemas
export const createServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  features: z.union([z.array(z.string()), z.string()]),
  category: z.string(),
  thumbnailUrl: z.string().url().optional(),
  imageUrls: z.union([z.array(z.string().url()), z.string()]).optional(),
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
  requirements: z.union([z.record(z.string(), z.unknown()), z.string()]),
  discount: z.object({
    code: z.string(),
  }).optional(),
});