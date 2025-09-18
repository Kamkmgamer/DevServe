import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import crypto from 'crypto';
import logger from './lib/logger';
import { metricsMiddleware } from './middleware/metrics';
import { requestId } from './middleware/requestId';
import { generalLimiter } from './middleware/rateLimit';
import { jsonParseErrorHandler } from './middleware/jsonError';
import apiRoutes from './routes';
import { metricsHandler } from './lib/metrics';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';

// Create the Express app instance
const app = express();

// Trust proxy (needed when behind reverse proxies like Nginx/Heroku) for correct protocol detection
app.set('trust proxy', 1);

// Apply middleware
app.use(requestId);
// Collect HTTP metrics for all requests
app.use(metricsMiddleware);
// Apply general API rate limiter
app.use(generalLimiter);
// Generate a per-request CSP nonce and expose it via res.locals
app.use((req: Request, res: Response, next: NextFunction) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;
  next();
});
// Build CSP connect-src dynamically to support dev tooling (e.g., Vite HMR over localhost)
const isProd = process.env.NODE_ENV === 'production';
const devConnectSrc = [
  "'self'",
  'ws:',
  'wss:',
  'http://localhost:5173',
  'ws://localhost:5173',
];

app.use(helmet({
  hsts: false,
  referrerPolicy: { policy: 'no-referrer' },
  frameguard: { action: 'sameorigin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      // Disallow inline scripts/styles; allow only with a per-request nonce
      scriptSrc: [
        "'self'",
        (_req: unknown, res: unknown) => `"nonce-${(res as { locals?: { cspNonce?: string } }).locals?.cspNonce || ''}"`,
      ],
      styleSrc: [
        "'self'",
        (_req: unknown, res: unknown) => `"nonce-${(res as { locals?: { cspNonce?: string } }).locals?.cspNonce || ''}"`,
      ],
      imgSrc: ["'self'", 'data:'],
      connectSrc: isProd ? ["'self'"] : devConnectSrc,
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
}));
// CORS: allow configurable origins via env, fallback to safe defaults
const defaultOrigins = [
  'http://localhost:5173',
  'http://192.168.0.100:5173',
];
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowNgrok = true; // keep allowing ngrok for dev/testing
const corsOrigins = [
  ...defaultOrigins,
  ...envOrigins,
  ...(allowNgrok ? [/.ngrok-free\.app$/] : []),
];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','x-csrf-token']
  })
);
app.use(cookieParser());
app.use(express.json());
// Handle malformed JSON bodies in a standardized way (400 BAD_REQUEST)
app.use(jsonParseErrorHandler);

// CSRF protection (cookie-based token). Ignore during tests.
if (process.env.NODE_ENV !== 'test') {
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: isProd ? 'strict' : 'lax',
        secure: isProd,
        // set explicit cookie name for clarity
        key: '_csrf',
      },
    }) as unknown as express.RequestHandler
  );
}

// Enforce HTTPS in production and add HSTS header
app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    const proto = (req.headers['x-forwarded-proto'] as string) || (req.protocol as string);
    if (proto && proto !== 'https') {
      const host = req.headers.host;
      const url = `https://${host}${req.originalUrl}`;
      return res.redirect(301, url);
    }
    // Add HSTS header: 1 year, include subdomains, allow preload
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = (req as any).requestId;
  const redactedHeaders = { ...req.headers };
  if (redactedHeaders.authorization) {
    redactedHeaders.authorization = '[REDACTED]';
  }

  const redactedBody = { ...req.body };
  if (redactedBody.password) {
    redactedBody.password = '[REDACTED]';
  }

  const bodyString = JSON.stringify(redactedBody);
  const truncatedBody = bodyString.length > 200 ? `${bodyString.substring(0, 200)}...` : bodyString;

  logger.info(`[${reqId}] [${req.method}] ${req.path} - Headers: ${JSON.stringify(redactedHeaders)} - Body: ${truncatedBody}`);
  next();
});

// Serve static files from the client dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  // Catch-all handler for SPA routing
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Apply API routes before the catch-all
app.use('/api', apiRoutes);

// Health Check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is healthy" });
});

// Expose Prometheus metrics
app.get('/metrics', metricsHandler);

// CSRF error handler: respond with 403 and code
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const hasCode = (e: unknown): e is { code: string } =>
    !!e && typeof e === 'object' && 'code' in (e as Record<string, unknown>) && typeof (e as { code?: unknown }).code === 'string';
  if (hasCode(err) && err.code === 'EBADCSRFTOKEN') {
    const requestId = (req as any).requestId;
    return res.status(403).json({
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'Invalid CSRF token',
        requestId,
      },
    });
  }
  next(err);
});

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`[404] ${req.method} ${req.path} - Not Found`);
  const requestId = (req as any).requestId;
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      requestId,
    },
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error });
  process.exit(1);
});

export default app;