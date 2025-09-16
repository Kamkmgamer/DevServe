import { Request, Response } from "express";
import { db } from '../lib/db';
import { users, refreshTokens } from '../lib/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import * as crypto from "crypto"; // For generating secure tokens (CJS-compatible)
import { sendEmail } from "../lib/mailer";
import { getEnvOrFile, normalizeMultiline } from "../lib/secrets";
import logger from "../lib/logger";
import { AuthRequest } from "../middleware/auth";
import type { User } from '../lib/db';

const isProd = process.env.NODE_ENV === 'production';

// NOTE: In a real app, you'd want to protect this route or handle admin creation manually.

const JWT_PRIVATE_KEY = normalizeMultiline(getEnvOrFile('JWT_PRIVATE_KEY'));
const JWT_SECRET = getEnvOrFile('JWT_SECRET');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
const JWT_KEY_ID = process.env.JWT_KEY_ID; // optional key id for rotation

function getPrivateKey(): string | undefined {
  return JWT_PRIVATE_KEY;
}

function signJwt(payload: { id: string; email: string; name: string; role: string }): string {
  const pk = getPrivateKey();

  // Build common JWT options
  const baseOptions: SignOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: JWT_EXPIRES_IN as any,
  };

  // Only include keyid if it is explicitly provided
  if (JWT_KEY_ID) {
    baseOptions.keyid = JWT_KEY_ID;
  }

  if (pk) {
    // RS256 path
    return jwt.sign(payload, pk, { ...baseOptions, algorithm: 'RS256' });
  }

  // HS256 fallback
  if (!JWT_SECRET) {
    throw new Error('JWT configuration missing: set JWT_PRIVATE_KEY (preferred) or JWT_SECRET');
  }

  return jwt.sign(payload, JWT_SECRET, baseOptions);
}

// Refresh token helpers
const REFRESH_TTL_MS = Number(process.env.REFRESH_TTL_MS || 1000 * 60 * 60 * 24 * 30); // 30d default
const REFRESH_COOKIE_NAME = 'refresh';
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax',
    // Make cookie available to all API routes
    path: '/',
    maxAge: REFRESH_TTL_MS,
  };
}
async function issueRefreshToken(userId: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const result = await db.insert(refreshTokens).values({
    tokenHash,
    userId,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  }).returning() as User[];
  const created = result[0];
  return { token, db: created };
}
async function revokeRefreshToken(tokenHash: string) {
  const tokenResult = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  const existing = tokenResult[0];
  if (!existing) return;
  if (existing.revokedAt) return;
  await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.tokenHash, tokenHash));
}

export const registerAdmin = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      role: "ADMIN",
    }).returning();
    res.status(201).json({ message: "Admin user created successfully" });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  // For registration
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const userResult = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role: 'USER',
  }).returning() as User[];
  const createdUser = userResult[0];

  if (!createdUser) {
    return res.status(500).json({ error: 'Failed to create user' });
  }

  const access = signJwt({ id: createdUser.id, email: createdUser.email, name: createdUser.name, role: createdUser.role });
  const isProd = process.env.NODE_ENV === 'production';
  const { token: refresh } = await issueRefreshToken(createdUser.id);
  res
    .cookie('session', access, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
    })
    // Remove legacy cookie scoped to /api/auth/refresh
    .clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth/refresh' })
    .cookie(REFRESH_COOKIE_NAME, refresh, refreshCookieOptions())
    .status(201)
    .json({ user: { id: createdUser.id, email: createdUser.email, name: createdUser.name, role: createdUser.role } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // For login
  const loginResult = await db.select().from(users).where(eq(users.email, email)) as User[];
  const user = loginResult[0];

  if (user && await bcrypt.compare(password, user.password)) {
    const access = signJwt({ id: user.id, email: user.email, name: user.name, role: user.role });
    const { token: refresh } = await issueRefreshToken(user.id);
    res
      .cookie('session', access, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        path: '/',
      })
      // Remove legacy cookie scoped to /api/auth/refresh
      .clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth/refresh' })
      .cookie(REFRESH_COOKIE_NAME, refresh, refreshCookieOptions())
      .json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userId = req.user.id;

  const userResult = await db.select().from(users).where(eq(users.id, userId)) as User[];
  const user = userResult[0];

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ error: "Invalid current password" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

  res.json({ message: "Password changed successfully" });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  const userResult = await db.select().from(users).where(eq(users.email, email)) as User[];
  const user = userResult[0];

  if (!user) {
    // For security, don't reveal if the email doesn't exist
    return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  }

  // Generate a secure, unique token
  const resetToken = crypto.randomBytes(32).toString("hex");
  // Hash the token using SHA-256 before storing (constant-time compare is not needed if we query by hash)
  const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set token expiration (e.g., 1 hour)
  const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour from now

  await db.update(users).set({
    passwordResetToken: hashedResetToken,
    passwordResetExpires: passwordResetExpires,
  }).where(eq(users.id, user.id));

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail(
      user.email,
      'Password Reset Request',
      `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
      `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the following link, or <a href="${resetUrl}">click here</a> to complete the process:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
    );
    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'Unknown error';
    logger.error("Error sending password reset email", { err: errMsg, email });
    res.status(500).json({ error: "Error sending password reset email." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  // Hash provided token using SHA-256 and find matching, non-expired user
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const resetResult = await db.select().from(users).where(and(
    eq(users.passwordResetToken, hashedToken),
    gt(users.passwordResetExpires!, new Date())  // Changed to gt for valid (expires > now)
  )) as User[];
  const resetUser = resetResult[0];

  if (!resetUser) {
    return res.status(400).json({ error: "Invalid or expired password reset token." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.update(users).set({
    password: hashedPassword,
    passwordResetToken: null, // Clear the token after use
    passwordResetExpires: null, // Clear the expiry
  }).where(eq(users.id, resetUser.id));

  res.status(200).json({ message: "Password has been reset successfully." });
};

interface CookieRequest extends Request {
  cookies: Record<string, string | undefined>;
}

export const logout = async (req: CookieRequest, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production';
  const refresh = req.cookies?.[REFRESH_COOKIE_NAME];
  if (refresh) {
    try {
      await revokeRefreshToken(hashToken(refresh));
    } catch {
      logger.warn('Failed to revoke refresh token on logout');
    }
  }
  res
    .clearCookie('session', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
    })
    .clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions())
    .status(200)
    .json({ message: 'Logged out' });
};

export const csrfToken = (req: Request & { csrfToken?: () => string }, res: Response) => {
  const token = req.csrfToken?.();
  if (!token) return res.status(500).json({ error: 'CSRF not initialized' });
  res.json({ csrfToken: token });
};

export const refresh = async (req: CookieRequest, res: Response) => {
  const refresh = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refresh) return res.status(401).json({ error: 'Missing refresh token' });
  const tokenHash = hashToken(refresh);
  const tokenResult = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  const existing = tokenResult[0];
  if (!existing || existing.revokedAt || existing.expiresAt <= new Date()) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  const resultUser = await db.select().from(users).where(eq(users.id, existing.userId));
  const user = resultUser[0];
  if (!user) return res.status(401).json({ error: 'User not found' });

  // Issue a fresh access token without rotating the refresh token.
  // This avoids race conditions when multiple tabs call /refresh simultaneously.
  const access = signJwt({ id: user.id, email: user.email, name: user.name, role: user.role });
  const isProd = process.env.NODE_ENV === 'production';
  res
    .cookie('session', access, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax' as 'strict' | 'lax',
      path: '/',
    })
    .json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
};