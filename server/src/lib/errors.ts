// server/src/lib/errors.ts
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'DB_UNIQUE_VIOLATION'
  | 'DB_NOT_FOUND'
  | 'DB_ERROR'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    status: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message = 'Bad request', details?: Record<string, unknown>) {
    return new AppError('BAD_REQUEST', message, 400, details);
  }
  static unauthorized(message = 'Unauthorized', details?: Record<string, unknown>) {
    return new AppError('UNAUTHORIZED', message, 401, details);
  }
  static forbidden(message = 'Forbidden', details?: Record<string, unknown>) {
    return new AppError('FORBIDDEN', message, 403, details);
  }
  static notFound(message = 'Not found', details?: Record<string, unknown>) {
    return new AppError('NOT_FOUND', message, 404, details);
  }
  static conflict(message = 'Conflict', details?: Record<string, unknown>) {
    return new AppError('CONFLICT', message, 409, details);
  }
  static tooManyRequests(message = 'Too many requests', details?: Record<string, unknown>) {
    return new AppError('TOO_MANY_REQUESTS', message, 429, details);
  }
  static internal(message = 'Internal server error', details?: Record<string, unknown>) {
    return new AppError('INTERNAL_ERROR', message, 500, details);
  }
}

export type ErrorResponse = {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
    requestId?: string;
  };
};
