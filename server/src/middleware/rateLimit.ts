import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Default: 5 requests per 15 minutes per IP for sensitive endpoints
const buildTooManyHandler = (message: string) =>
  (req: Request, res: Response) => {
    const requestId = (req as any).requestId as string | undefined;
    res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message,
        requestId,
      }
    });
  };

export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildTooManyHandler('Too many requests, please try again later.'),
});

// Optionally export a factory for custom configs
export const createLimiter = (max = 5, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: buildTooManyHandler('Too many requests, please try again later.'),
  });

// General API limiter: reasonable defaults for overall traffic shaping
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildTooManyHandler('Too many requests, please try again later.'),
});

// Short-window burst limiter for auth endpoints (stacked with sensitiveLimiter)
export const authBurstLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildTooManyHandler('Too many auth attempts, please slow down.'),
});
