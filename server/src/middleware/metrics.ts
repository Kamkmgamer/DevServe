import { Request, Response, NextFunction } from 'express';
import { httpRequestDurationSeconds } from '../lib/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    const route = (req as any).route?.path || req.path || 'unknown_route';
    end({
      method: req.method,
      route,
      status_code: String(res.statusCode),
    });
  });
  next();
}
