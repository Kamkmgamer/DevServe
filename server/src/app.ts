// server/src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./lib/logger";

// Load environment variables
dotenv.config();

// Create the Express app instance
const app = express();

// Apply middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://192.168.0.100:5173',
      /\.ngrok-free\.app$/
    ],
    credentials: true
  })
);
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.path} - Headers: ${JSON.stringify(req.headers)} - Body: ${JSON.stringify(req.body)}`);
  next();
});

// API routes
app.use("/api", apiRoutes);

// Health Check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is healthy" });
});

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`[404] ${req.method} ${req.path} - Not Found`);
  res.status(404).json({ message: "Route not found" });
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