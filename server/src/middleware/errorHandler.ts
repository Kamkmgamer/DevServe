import { Request, Response, NextFunction } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
} from '@prisma/client/runtime/library';
import logger from '../lib/logger';
import { redactSensitive } from '../lib/redact';
import { AppError, ErrorResponse } from '../lib/errors';
import { ZodError } from 'zod';

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

  // Normalize to AppError
  let appErr: AppError;
  if (error instanceof AppError) {
    appErr = error;
  } else if (error instanceof ZodError) {
    appErr = AppError.badRequest('Validation failed', {
      issues: error.issues.map((i) => ({
        path: i.path,
        message: i.message,
        code: i.code,
      })),
    });
  } else if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      appErr = new AppError(
        'DB_UNIQUE_VIOLATION',
        'Unique constraint violation',
        409,
        { target: (error as any).meta?.target }
      );
    } else if (error.code === 'P2025') {
      appErr = new AppError('DB_NOT_FOUND', 'Record not found', 404);
    } else if (error.code === 'P2003') {
      // Foreign key constraint failed
      appErr = new AppError(
        'DB_FOREIGN_KEY',
        'Foreign key constraint violation',
        409,
        { field: ((error as any).meta as any)?.field_name || ((error as any).meta as any)?.target }
      );
    } else {
      appErr = new AppError('DB_ERROR', 'Database error', 400);
    }
  } else if (error instanceof PrismaClientValidationError) {
    appErr = AppError.badRequest('Invalid request for database operation', {
      message: error.message,
    });
  } else if (
    error instanceof PrismaClientInitializationError ||
    error instanceof PrismaClientRustPanicError
  ) {
    appErr = AppError.internal('Database initialization error', {
      message: error.message,
    });
  } else {
    appErr = AppError.internal();
  }

  const requestId = (req as any).requestId as string | undefined;
  const response: ErrorResponse = {
    error: {
      code: appErr.code,
      message: appErr.message,
      details: isDev ? { ...(appErr.details || {}), stack: (error as any)?.stack } : appErr.details,
      requestId,
    },
  };

  res.status(appErr.status).json(response);
};