import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodTypeAny } from 'zod';

/**
 * Validate request using Zod. Supports body, params, and query.
 * Usage:
 *   validate({ body: schemaA, params: schemaB, query: schemaC })
 *   or validate(schemaForBody)
 * Responds with consistent error shape: { message, errors: [{ location, field, message }] }
 */
export const validate = (
  schemas:
    | ZodTypeAny
    | {
        body?: ZodTypeAny;
        params?: ZodTypeAny;
        query?: ZodTypeAny;
      }
) => {
  const normalized: { body?: ZodTypeAny; params?: ZodTypeAny; query?: ZodTypeAny } =
    'parse' in (schemas as any)
      ? { body: schemas as ZodTypeAny }
      : (schemas as any);

  return (req: Request, res: Response, next: NextFunction) => {
    const allErrors: Array<{ location: 'body' | 'params' | 'query'; field: string; message: string }> = [];

    // body
    if (normalized.body) {
      const result = normalized.body.safeParse(req.body);
      if (!result.success) {
        allErrors.push(
          ...result.error.issues.map((issue) => ({
            location: 'body' as const,
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
      } else {
        (req as any).body = result.data;
      }
    }

    // params
    if (normalized.params) {
      const result = normalized.params.safeParse(req.params);
      if (!result.success) {
        allErrors.push(
          ...result.error.issues.map((issue) => ({
            location: 'params' as const,
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
      } else {
        (req as any).params = result.data;
      }
    }

    // query
    if (normalized.query) {
      const result = normalized.query.safeParse(req.query);
      if (!result.success) {
        allErrors.push(
          ...result.error.issues.map((issue) => ({
            location: 'query' as const,
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
      } else {
        (req as any).query = result.data;
      }
    }

    if (allErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: allErrors });
    }

    return next();
  };
};