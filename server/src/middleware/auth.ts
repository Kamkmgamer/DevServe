import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

// Ensure JWT_SECRET is loaded and available
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the environment.");
  process.exit(1);
}

export const authMiddleware = (
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
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