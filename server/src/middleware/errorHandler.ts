import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../lib/logger';
import { redactSensitive } from '../lib/redact';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  const safePayload = {
    path: req.path,
    method: req.method,
    body: isDev ? req.body : redactSensitive(req.body),
    params: isDev ? req.params : redactSensitive(req.params),
    query: isDev ? req.query : redactSensitive(req.query),
  };

  logger.error('=== SERVER ERROR ===', {
    message: error?.message,
    stack: isDev ? error?.stack : undefined,
    ...safePayload,
    // Avoid dumping entire error objects in prod
    error: isDev ? error : undefined,
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