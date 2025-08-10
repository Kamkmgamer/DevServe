import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // For generating secure tokens
import { forgotPasswordRequestSchema, resetPasswordSchema } from "../lib/validation"; // Import new schemas
import { sendEmail } from "../lib/mailer";

// NOTE: In a real app, you'd want to protect this route or handle admin creation manually.

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
    
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role }, // Changed userId to id
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

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

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role }, // Changed userId to id
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

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
  const hashedResetToken = await bcrypt.hash(resetToken, 10); // Hash the token before storing

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

  // Find user by the hashed token and check expiry
  const user = await prisma.user.findFirst({
    where: {
      passwordResetExpires: {
        gt: new Date(), // Token must not be expired
      },
    },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired password reset token." });
  }

  // Compare the provided token with the hashed token in the database
  const isTokenValid = user.passwordResetToken && await bcrypt.compare(token, user.passwordResetToken);

  if (!isTokenValid) {
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