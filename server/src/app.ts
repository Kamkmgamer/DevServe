// server/src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { Request, Response, NextFunction } from "express";

// Load environment variables
dotenv.config();

// Create the Express app instance
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
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
  console.log(`[404] ${req.method} ${req.path} - Not Found`);
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('=== SERVER ERROR ===');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Body:', req.body);
  console.error('Params:', req.params);
  console.error('Query:', req.query);
  console.error('Error:', error);
  
  // Handle Prisma errors
  if (error.code === 'P2002') {
    return res.status(400).json({ 
      message: "Unique constraint violation",
      field: error.meta?.target
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({ 
      message: "Record not found"
    });
  }
  
  if (error.code?.startsWith('P')) {
    return res.status(400).json({ 
      message: "Database error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Graceful shutdown
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;