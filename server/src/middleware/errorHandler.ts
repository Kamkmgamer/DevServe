import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../lib/logger';
import { redactSensitive } from '../lib/redact';
import { AppError, ErrorResponse } from '../lib/errors';

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
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      appErr = new AppError(
        'DB_UNIQUE_VIOLATION',
        'Unique constraint violation',
        409,
        { target: error.meta?.target }
      );
    } else if (error.code === 'P2025') {
      appErr = new AppError('DB_NOT_FOUND', 'Record not found', 404);
    } else {
      appErr = new AppError('DB_ERROR', 'Database error', 400);
    }
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