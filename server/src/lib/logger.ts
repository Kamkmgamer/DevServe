import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, printf, colorize } = winston.format;

const isDevelopment = process.env.NODE_ENV === 'development';

const consoleFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const transports: winston.transport[] = [];

// Console logging for all environments (structured JSON by default)
transports.push(new winston.transports.Console({
  level: isDevelopment ? 'debug' : 'info',
  format: isDevelopment
    ? combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat)
    : combine(timestamp(), json()),
}));

// Daily rotated files (production and development if desired)
transports.push(new DailyRotateFile({
  level: 'info',
  filename: 'logs/%DATE%-app.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '7d',
  format: combine(timestamp(), json()),
}));
transports.push(new DailyRotateFile({
  level: 'error',
  filename: 'logs/%DATE%-error.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '7d',
  format: combine(timestamp(), json()),
}));

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: combine(timestamp(), json()),
  transports,
});

// No additional transport needed here; already configured above.

export default logger;
