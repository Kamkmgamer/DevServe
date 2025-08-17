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
  imageUrls: z.union([z.array(z.string()), z.string()]).optional(),
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

// Contact schemas
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
});

// Payments schemas
export const createCheckoutSessionSchema = z.object({
  serviceId: z.string().min(1),
  clientEmail: z.string().email(),
});

export const createPaypalOrderSchema = z.object({
  totalCents: z.number().int().positive(),
});

export const capturePaypalOrderSchema = z.object({
  authorizationId: z.string().min(1),
  totalCents: z.number().int().positive(),
});

// Common param schemas
export const idParamSchema = z.object({ id: z.string().min(1) });
export const cartItemParamSchema = z.object({ itemId: z.string().min(1) });
export const codeParamSchema = z.object({ code: z.string().min(1) });

// Blog schemas
export const createBlogPostSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1),
    content: z.string().min(1),
    thumbnailUrl: z.string().url().optional(),
    userId: z.string().optional(),
  })
  .passthrough();

export const updateBlogPostSchema = createBlogPostSchema.partial().passthrough();

// Portfolio schemas
export const createPortfolioSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    thumbnailUrl: z.string().url().optional(),
    imageUrls: z.union([z.string(), z.array(z.string())]),
  })
  .passthrough();

export const updatePortfolioSchema = createPortfolioSchema.partial().passthrough();

// Orders schemas
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'PAID',
    'IN_TECHNICAL_REVIEW',
    'APPROVED',
    'FAILED',
    'REFUNDED',
    'CANCELED',
  ]),
});

// Chatbot schemas
export const chatCompletionSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1),
      })
    )
    .min(1),
});

// Referral schemas
export const createReferralSchema = z.object({
  code: z.string().min(1),
  commissionRate: z.number().min(0).max(1),
});
export const updateReferralSchema = createReferralSchema.partial();

// Commissions schemas
export const updateCommissionSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'UNPAID']),
});

// Payouts schemas
export const createPayoutSchema = z.object({
  referralId: z.string().min(1),
  amount: z.number().int().positive(),
});

// Admin user management schemas
export const adminCreateUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(
      strongPasswordRegex,
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    ),
  name: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']).optional(),
});
export const adminUpdateUserSchema = adminCreateUserSchema.partial();

// Coupons schemas
export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Code is required')
      .transform((s) => s.toUpperCase()),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().positive().int(),
    minOrderAmount: z.number().positive().int().optional().nullable(),
    maxUses: z.number().positive().int().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    active: z.boolean(),
  })
  .refine((d) => (d.type === 'percentage' ? d.value <= 100 : true), {
    path: ['value'],
    message: 'Percentage value may not exceed 100',
  });

export const couponUpdateSchema = couponSchema.partial();

export const couponCodeParamSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.toUpperCase()),
});

// Common query schemas
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
});