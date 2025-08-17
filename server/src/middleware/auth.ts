import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError, VerifyOptions } from "jsonwebtoken";
import prisma from "../lib/prisma"; // Import prisma client

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

// Load verification material: prefer RS256 with public key, otherwise HS256 secret
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

function getPublicKey(): string | undefined {
  if (!JWT_PUBLIC_KEY) return undefined;
  return JWT_PUBLIC_KEY.includes('\\n') ? JWT_PUBLIC_KEY.replace(/\\n/g, '\n') : JWT_PUBLIC_KEY;
}

const PUBLIC_KEY = getPublicKey();
if (!PUBLIC_KEY && !JWT_SECRET) {
  console.error("FATAL ERROR: JWT verification material missing. Set JWT_PUBLIC_KEY (preferred) or JWT_SECRET.");
  process.exit(1);
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access denied. No token provided or token is not a Bearer token.",
      code: "NO_TOKEN_PROVIDED"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verifyKey: string = PUBLIC_KEY || (JWT_SECRET as string);
    const options: VerifyOptions = PUBLIC_KEY ? { algorithms: ['RS256'] } : { algorithms: ['HS256'] };
    const decoded = jwt.verify(token, verifyKey, options) as { id: string };
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