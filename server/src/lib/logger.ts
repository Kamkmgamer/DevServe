import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, printf, colorize } = winston.format;

const env = process.env.NODE_ENV || 'development';
const isDevelopment = env === 'development';
const isTest = env === 'test';
const levelFromEnv = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Simple sanitizer to redact sensitive fields
const SENSITIVE_KEYS = [
  'authorization', 'password', 'pwd', 'secret', 'api_key', 'apikey', 'token', 'access_token', 'refresh_token', 'stripe_secret_key', 'jwt_secret'
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

const sanitizeFormat = winston.format((info) => {
  // Redact known sensitive keys in the root info and nested meta
  for (const key of Object.keys(info)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      info[key] = redactValue(info[key]);
    }
  }
  // Attempt to sanitize message if it's a JSON-like string containing sensitive keys
  if (typeof info.message === 'string') {
    let msg = info.message;
    for (const k of SENSITIVE_KEYS) {
      const r = new RegExp(`("${k}"\\s*:\\s*")[^"]+("")?`, 'gi');
      msg = msg.replace(r, `$1***$2`);
    }
    // Mask bare tokens (base64/jwt-ish) in messages
    msg = msg.replace(/[A-Za-z0-9-_]{16,}\.[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}/g, '***.***.***');
    info.message = msg;
  }
  return info;
});

const consoleFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const transports: winston.transport[] = [];

// Console logging for all environments (structured JSON by default)
transports.push(new winston.transports.Console({
  level: levelFromEnv,
  format: isDevelopment
    ? combine(sanitizeFormat(), colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat)
    : combine(sanitizeFormat(), timestamp(), json()),
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
    format: combine(sanitizeFormat(), timestamp(), json()),
  }));
  transports.push(new DailyRotateFile({
    level: 'error',
    filename: 'logs/%DATE%-error.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '7d',
    format: combine(sanitizeFormat(), timestamp(), json()),
  }));
}

const logger = winston.createLogger({
  level: levelFromEnv,
  format: combine(sanitizeFormat(), timestamp(), json()),
  transports,
});

// No additional transport needed here; already configured above.

export default logger;
