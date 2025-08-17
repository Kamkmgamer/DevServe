import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import * as crypto from "crypto"; // For generating secure tokens (CJS-compatible)
import { forgotPasswordRequestSchema, resetPasswordSchema } from "../lib/validation"; // Import new schemas
import { sendEmail } from "../lib/mailer";
import { getEnvOrFile, normalizeMultiline } from "../lib/secrets";

// NOTE: In a real app, you'd want to protect this route or handle admin creation manually.

const JWT_PRIVATE_KEY = normalizeMultiline(getEnvOrFile('JWT_PRIVATE_KEY'));
const JWT_SECRET = getEnvOrFile('JWT_SECRET');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
const JWT_KEY_ID = process.env.JWT_KEY_ID; // optional key id for rotation

function getPrivateKey(): string | undefined {
  return JWT_PRIVATE_KEY;
}

function signJwt(payload: object): string {
  const pk = getPrivateKey();
  if (pk) {
    const options: SignOptions = {
      algorithm: 'RS256',
      expiresIn: JWT_EXPIRES_IN as any,
      keyid: JWT_KEY_ID,
    };
    return jwt.sign(payload as any, pk as any, options);
  }
  if (!JWT_SECRET) {
    throw new Error('JWT configuration missing: set JWT_PRIVATE_KEY (preferred) or JWT_SECRET');
  }
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any, keyid: JWT_KEY_ID };
  return jwt.sign(payload as any, JWT_SECRET as any, options);
}

export const registerAdmin = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });
    res.status(201).json({ message: "Admin user created successfully" });
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER",
      },
    });

    const token = signJwt({ id: user.id, email: user.email, name: user.name, role: user.role });

    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signJwt({ id: user.id, email: user.email, name: user.name, role: user.role });

  res.json({ token });
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ error: "Invalid current password" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res.json({ message: "Password changed successfully" });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: passwordResetExpires,
    },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail(
      user.email,
      'Password Reset Request',
      `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
      `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the following link, or <a href="${resetUrl}">click here</a> to complete the process:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
    );
    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ error: "Error sending password reset email." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  // Hash provided token using SHA-256 and find matching, non-expired user
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(), // Token must not be expired
      },
    },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired password reset token." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null, // Clear the token after use
      passwordResetExpires: null, // Clear the expiry
    },
  });

  res.status(200).json({ message: "Password has been reset successfully." });
};