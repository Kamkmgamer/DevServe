import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { runWithRequestContext } from '../lib/httpContext';

function generateId() {
  // Prefer built-in randomUUID if available
  if ((crypto as any).randomUUID) return (crypto as any).randomUUID();
  return crypto.randomBytes(16).toString('hex');
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = (req.headers['x-request-id'] as string) || '';
  const id = incoming || generateId();
  // Attach to request and response for downstream usage
  (req as any).requestId = id;
  res.locals.requestId = id;
  res.setHeader('X-Request-ID', id);
  // Initialize async context for this request so loggers can access it
  runWithRequestContext({ requestId: id }, () => next());
}
