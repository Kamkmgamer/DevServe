import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

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
  next();
}
