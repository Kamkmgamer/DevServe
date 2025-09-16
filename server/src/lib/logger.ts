import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getRequestId } from '../lib/httpContext';

const { combine, timestamp, json, printf, colorize } = winston.format;

const env = process.env.NODE_ENV || 'development';
const isDevelopment = env === 'development';
const isTest = env === 'test';
const levelFromEnv = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Simple sanitizer to redact sensitive fields
const SENSITIVE_KEYS = [
  'authorization', 'password', 'pwd', 'secret', 'api_key', 'apikey', 'token', 'access_token', 'refresh_token', 'stripe_secret_key', 'jwt_secret',
  // additional PII
  'email', 'phone', 'phone_number', 'ssn', 'social_security_number', 'credit_card', 'card_number', 'cvv', 'cvc', 'expiry', 'iban', 'bic',
  'address', 'street', 'city', 'zip', 'postal_code', 'set-cookie'
];

function redactValue(val: unknown): unknown {
  if (typeof val === 'string') {
    // Mask long token-like strings
    if (val.length > 12) return val.substring(0, 4) + '...' + val.substring(val.length - 4);
    return '***';
  }
  if (typeof val === 'number' || typeof val === 'boolean') return '***';
  return '***';
}

// Attach correlation id from AsyncLocalStorage, if present
interface LogInfo extends winston.Logform.TransformableInfo {
  requestId?: string;
  headers?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  context?: Record<string, unknown>;
  message: string;
}

// Attach correlation id from AsyncLocalStorage, if present
const requestIdFormat = winston.format((info: winston.Logform.TransformableInfo) => {
  const id = getRequestId();
  if (id && !(info as any).requestId) {
    (info as any).requestId = id;
  }
  return info;
});

// Deeply redact nested objects/arrays by sensitive keys
function deepRedact(obj: unknown): unknown {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(deepRedact);
  if (typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
        out[k] = redactValue(v);
      } else if (v && typeof v === 'object') {
        out[k] = deepRedact(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return obj;
}

const sanitizeFormat = winston.format((info: winston.Logform.TransformableInfo) => {
  // Redact known sensitive keys in the root info and nested meta
  for (const key of Object.keys(info)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      (info as any)[key] = redactValue((info as any)[key]);
    }
  }
  // Redact common nested containers
  if ((info as any).headers) (info as any).headers = deepRedact((info as any).headers) as Record<string, unknown>;
  if ((info as any).meta) (info as any).meta = deepRedact((info as any).meta) as Record<string, unknown>;
  if ((info as any).context) (info as any).context = deepRedact((info as any).context) as Record<string, unknown>;

  // Attempt to sanitize message if it's a JSON-like string containing sensitive keys
  if (typeof (info as any).message === 'string') {
    let msg = (info as any).message as string;
    for (const k of SENSITIVE_KEYS) {
      const r = new RegExp(`("${k}"\s*:\s* ")[^ " ]+(" )?`, 'gi');
      msg = msg.replace(r, `$1***$2`);
    }
    // Mask bare tokens (base64/jwt-ish) in messages
    msg = msg.replace(/[A-Za-z0-9-_]{16,}\.[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}/g, '***.***.***');
    (info as any).message = msg;
  }
  return info;
});

const consoleFormat = printf((info: winston.Logform.TransformableInfo) => {
  const level = (info as any).level;
  const message = (info as any).message;
  const timestamp = (info as any).timestamp;
  const reqId = (info as any).requestId ? ` [${(info as any).requestId}]` : '';
  return `${timestamp} ${level}${reqId}: ${message}`;
});


const transports: winston.transport[] = [];

// Console logging for all environments (structured JSON by default)
transports.push(new winston.transports.Console({
  level: levelFromEnv,
  format: isDevelopment
    ? combine(requestIdFormat(), sanitizeFormat(), colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat)
    : combine(requestIdFormat(), sanitizeFormat(), timestamp(), json()),
}));

// Daily rotated files (skip in test to avoid open handle leaks)
if (!isTest) {
  transports.push(new DailyRotateFile({
    level: 'info',
    filename: 'logs/%DATE%-app.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '7d',
    format: combine(requestIdFormat(), sanitizeFormat(), timestamp(), json()),
  }));
  transports.push(new DailyRotateFile({
    level: 'error',
    filename: 'logs/%DATE%-error.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '7d',
    format: combine(requestIdFormat(), sanitizeFormat(), timestamp(), json()),
  }));
}

const logger = winston.createLogger({
  level: levelFromEnv,
  format: combine(requestIdFormat(), sanitizeFormat(), timestamp(), json()),
  transports,
});

// No additional transport needed here; already configured above.

export default logger;
