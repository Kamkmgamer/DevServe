// server/src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./lib/logger";
import { requestId } from "./middleware/requestId";
import { metricsMiddleware } from "./middleware/metrics";
import { metricsHandler } from "./lib/metrics";
import { generalLimiter } from "./middleware/rateLimit";
import { jsonParseErrorHandler } from "./middleware/jsonError";
import helmet from "helmet";

// Load environment variables
dotenv.config();

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
// Security headers; we set HSTS below conditionally, so disable here
app.use(helmet({
  hsts: false,
  referrerPolicy: { policy: 'no-referrer' },
  frameguard: { action: 'sameorigin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://192.168.0.100:5173',
      /.ngrok-free\.app$/
    ],
    credentials: true
  })
);
app.use(express.json());
// Handle malformed JSON bodies in a standardized way (400 BAD_REQUEST)
app.use(jsonParseErrorHandler);

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

// API routes
app.use("/api", apiRoutes);

// Health Check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is healthy" });
});

// Expose Prometheus metrics
app.get('/metrics', metricsHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`[404] ${req.method} ${req.path} - Not Found`);
  const requestId = (req as any).requestId as string | undefined;
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