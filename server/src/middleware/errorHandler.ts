import { Request, Response, NextFunction } from 'express';
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

  // Log enriched PG error fields when available
  const pgInfo = error && typeof error === 'object' ? {
    pg: {
      code: (error as any).code,
      detail: (error as any).detail,
      schema: (error as any).schema,
      table: (error as any).table,
      constraint: (error as any).constraint,
      column: (error as any).column,
      routine: (error as any).routine,
    }
  } : undefined;

  logger.error('=== SERVER ERROR ===', {
    message: error?.message,
    stack: isDev ? error?.stack : undefined,
    ...safePayload,
    ...pgInfo,
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
  } else if (error.code === 'P2002') {
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
  } else if (error && typeof error === 'object' && typeof (error as any).code === 'string') {
    // Map common Postgres SQLSTATE error codes for clearer responses
    const code = (error as any).code as string;
    switch (code) {
      case '42P01': // undefined_table
        appErr = new AppError('DB_TABLE_NOT_FOUND', 'Database table not found', 500, { table: (error as any).table });
        break;
      case '42703': // undefined_column
        appErr = new AppError('DB_COLUMN_NOT_FOUND', 'Database column not found', 500, { column: (error as any).column, table: (error as any).table });
        break;
      case '42501': // insufficient_privilege
        appErr = new AppError('DB_PERMISSION_DENIED', 'Database permission denied', 403, { schema: (error as any).schema, table: (error as any).table });
        break;
      case '23505': // unique_violation
        appErr = new AppError('DB_UNIQUE_VIOLATION', 'Unique constraint violation', 409, { constraint: (error as any).constraint });
        break;
      case '23503': // foreign_key_violation
        appErr = new AppError('DB_FOREIGN_KEY', 'Foreign key constraint violation', 409, { constraint: (error as any).constraint });
        break;
      case '22P02': // invalid_text_representation (e.g., invalid uuid)
        appErr = new AppError('DB_INVALID_TEXT', 'Invalid value format for database field', 400, { column: (error as any).column });
        break;
      default:
        appErr = new AppError('DB_ERROR', 'Database error', 500, { code });
    }
  } else {
    appErr = new AppError('DB_ERROR', 'Database error', 500);
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