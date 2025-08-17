import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

// Converts body-parser JSON parse errors into a standardized AppError (400)
export function jsonParseErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // body-parser sets type/code/status for JSON errors
  const isJsonSyntaxError = err instanceof SyntaxError && (err as any).status === 400 && 'body' in err;
  const isEntityParseFailed = (err as any)?.type === 'entity.parse.failed' || (err as any)?.code === 'INVALID_JSON';

  if (isJsonSyntaxError || isEntityParseFailed) {
    const details = {
      reason: err.message,
    } as Record<string, unknown>;
    next(AppError.badRequest('Invalid JSON payload', details));
    return;
  }

  // Not a JSON parsing error; pass along
  next(err);
}
