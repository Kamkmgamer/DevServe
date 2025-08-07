import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../lib/logger';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('=== SERVER ERROR ===', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    error,
  });

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
    return res.status(400).json({ 
      message: "Database error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};