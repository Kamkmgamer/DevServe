import rateLimit from 'express-rate-limit';

// Default: 5 requests per 15 minutes per IP for sensitive endpoints
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests, please try again later.'
  }
});

// Optionally export a factory for custom configs
export const createLimiter = (max = 5, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many requests, please try again later.'
    }
  });
