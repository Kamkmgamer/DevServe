
import { login, registerAdmin, changePassword, requestPasswordReset, resetPassword } from '../../api/auth';
import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Import crypto for mocking
import { sendEmail } from '../../lib/mailer';

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(), // Mock update
      findFirst: jest.fn(), // Mock findFirst
    },
  },
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mockResetToken'),
  })),
}));
jest.mock('../../lib/mailer', () => ({
  __esModule: true,
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'password' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const user = { id: '1', email: 'test@example.com', password: 'hashedPassword', name: 'Test User', role: 'USER' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: 'test-token' });
    });

    it('should return 401 for invalid credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrong-password' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('registerAdmin', () => {
    it('should create a new admin user', async () => {
      const req = { body: { email: 'admin@example.com', password: 'password', name: 'Admin' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1' });

      await registerAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Admin user created successfully' });
    });

    it('should return 400 if the user already exists', async () => {
      const req = { body: { email: 'admin@example.com', password: 'password', name: 'Admin' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockRejectedValue(new Error('User already exists'));

      await registerAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully for a valid user', async () => {
      const req = {
        body: { currentPassword: 'oldPassword', newPassword: 'newPassword123!' },
        user: { id: '1' }
      } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const user = { id: '1', password: 'hashedOldPassword' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      (prisma.user.update as jest.Mock).mockResolvedValue(user);

      await changePassword(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'hashedOldPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123!', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashedNewPassword' },
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Password changed successfully' });
    });

    it('should return 401 for invalid current password', async () => {
      const req = {
        body: { currentPassword: 'wrongPassword', newPassword: 'newPassword123!' },
        user: { id: '1' }
      } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const user = { id: '1', password: 'hashedOldPassword' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Incorrect password

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid current password' });
    });

    it('should return 401 if user not found', async () => {
      const req = {
        body: { currentPassword: 'oldPassword', newPassword: 'newPassword123!' },
        user: { id: '1' }
      } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // User not found

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid current password' }); // Generic error for security
    });
  });

  describe('requestPasswordReset', () => {
    it('should send a reset link and update user with token for existing email', async () => {
      const req = { body: { email: 'test@example.com' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const user = { id: '1', email: 'test@example.com' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.user.update as jest.Mock).mockResolvedValue(user);

      await requestPasswordReset(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      // SHA-256 hash of 'mockResetToken'
      const expectedHash = crypto.createHash('sha256').update('mockResetToken').digest('hex');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          passwordResetToken: expectedHash,
          passwordResetExpires: expect.any(Date),
        }),
      });
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If an account with that email exists, a password reset link has been sent.' });
    });

    it('should return 200 OK even for non-existent email for security reasons', async () => {
      const req = { body: { email: 'nonexistent@example.com' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await requestPasswordReset(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(crypto.randomBytes).not.toHaveBeenCalled(); // Should not generate token
      expect(prisma.user.update).not.toHaveBeenCalled(); // Should not update user
      expect(sendEmail).not.toHaveBeenCalled(); // Should not send email
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If an account with that email exists, a password reset link has been sent.' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with a valid token', async () => {
      const req = { body: { token: 'validToken', newPassword: 'newPassword123!' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const user = {
        id: '1',
        password: 'oldHashedPassword',
        passwordResetToken: crypto.createHash('sha256').update('validToken').digest('hex'),
        passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour from now
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      (prisma.user.update as jest.Mock).mockResolvedValue(user);

      await resetPassword(req, res);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          passwordResetToken: crypto.createHash('sha256').update('validToken').digest('hex'),
          passwordResetExpires: {
            gt: expect.any(Date),
          },
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123!', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          password: 'hashedNewPassword',
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset successfully.' });
    });

    it('should return 400 for invalid or expired token (user not found by token)', async () => {
      const req = { body: { token: 'invalidToken', newPassword: 'newPassword123!' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // Token not found or expired

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired password reset token.' });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should return 400 if no matching user found for provided token (mismatch)', async () => {
      const req = { body: { token: 'mismatchedToken', newPassword: 'newPassword123!' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      // Simulate that no user matches the hashed token
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired password reset token.' });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
