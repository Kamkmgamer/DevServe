import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError, VerifyOptions, JwtPayload } from "jsonwebtoken";
import prisma from "../lib/prisma"; // Import prisma client
import { getEnvOrFile, normalizeMultiline } from "../lib/secrets";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    password?: string;
    name?: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Key loading and rotation support
// Prefer RS256 public keys. Support multiple keys via JWT_PUBLIC_KEYS (JSON map of kid->PEM), else single JWT_PUBLIC_KEY.
// Fallback to HS256 only in non-production environments if JWT_SECRET is set.
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_PUBLIC_KEYS_JSON = getEnvOrFile('JWT_PUBLIC_KEYS');
const JWT_PUBLIC_KEY = normalizeMultiline(getEnvOrFile('JWT_PUBLIC_KEY'));
const JWT_SECRET = getEnvOrFile('JWT_SECRET');

let PUBLIC_KEYS: Record<string, string> | null = null; // kid -> PEM
if (JWT_PUBLIC_KEYS_JSON) {
  try {
    const parsed = JSON.parse(JWT_PUBLIC_KEYS_JSON);
    // Normalize any \n sequences in PEMs
    PUBLIC_KEYS = Object.fromEntries(
      Object.entries(parsed).map(([kid, pem]) => [kid, normalizeMultiline(String(pem))!])
    );
  } catch (e) {
    console.error('Invalid JWT_PUBLIC_KEYS JSON');
    PUBLIC_KEYS = null;
  }
}
const SINGLE_PUBLIC_KEY = JWT_PUBLIC_KEY || undefined;

function selectVerifyMaterial(token: string): { key: string; options: VerifyOptions } | null {
  // If we have multiple public keys, try to use kid from header
  if (PUBLIC_KEYS) {
    const decodedHeader = jwt.decode(token, { complete: true }) as { header?: { kid?: string } } | null;
    const kid = decodedHeader?.header?.kid;
    if (kid && PUBLIC_KEYS[kid]) {
      return { key: PUBLIC_KEYS[kid], options: { algorithms: ['RS256'] } };
    }
    // If kid missing or not found, reject in production, else try any key
    if (NODE_ENV === 'production') return null;
    const firstKey = Object.values(PUBLIC_KEYS)[0];
    if (firstKey) return { key: firstKey, options: { algorithms: ['RS256'] } };
  }
  if (SINGLE_PUBLIC_KEY) {
    return { key: SINGLE_PUBLIC_KEY, options: { algorithms: ['RS256'] } };
  }
  // Only allow HS256 fallback outside production
  if (NODE_ENV !== 'production' && JWT_SECRET) {
    return { key: JWT_SECRET, options: { algorithms: ['HS256'] } };
  }
  return null;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const bearer = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined;
  // Prefer Authorization header; fallback to cookie named "session"
  const cookieToken = (req as any).cookies?.session as string | undefined;
  const token = bearer || cookieToken;
  if (!token) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
      code: "NO_TOKEN_PROVIDED"
    });
  }

  try {
    const material = selectVerifyMaterial(token);
    if (!material) {
      return res.status(500).json({
        error: NODE_ENV === 'production'
          ? 'JWT verification keys are not configured'
          : 'JWT verification material missing (set JWT_PUBLIC_KEYS or JWT_PUBLIC_KEY, or JWT_SECRET for dev).',
        code: 'JWT_CONFIG_MISSING'
      });
    }
    const decoded = jwt.verify(token, material.key, material.options) as JwtPayload & { id: string };
    if (!decoded?.id) {
      return res.status(400).json({ error: 'Invalid token payload', code: 'INVALID_TOKEN_PAYLOAD' });
    }
    req.userId = decoded.id;
    console.log('Protect middleware: decoded.userId', decoded.id);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    console.log('Protect middleware: fetched user', user);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user; // Attach the full user object to the request
    console.log('Protect middleware: req.user set', req.user);
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        error: "Access token expired.",
        code: "TOKEN_EXPIRED"
      });
    }
    if (error instanceof JsonWebTokenError) {
      return res.status(400).json({
        error: `Invalid token: ${error.message}`,
        code: "INVALID_TOKEN"
      });
    }
    // For other unexpected errors
    return res.status(500).json({
      error: "An unexpected error occurred during token validation.",
      code: "UNEXPECTED_AUTH_ERROR"
    });
  }
};

export const admin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user && (user.role === "ADMIN" || user.role === "SUPERADMIN")) {
      req.user = user; // Attach the full user object to the request
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admin role required." });
    }
  } catch (error) {
    console.error("Error in admin middleware:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const superadmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user && user.role === "SUPERADMIN") {
      req.user = user; // Attach the full user object to the request
      next();
    } else {
      res.status(403).json({ message: "Access denied. Superadmin role required." });
    }
  } catch (error) {
    console.error("Error in superadmin middleware:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};