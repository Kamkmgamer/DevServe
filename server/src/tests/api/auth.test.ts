import { login, registerAdmin, changePassword, requestPasswordReset, resetPassword, logout, refresh } from '../../api/auth';
import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { users, refreshTokens } from '../../lib/schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto'; // Use namespace import for compatibility
import { sendEmail } from '../../lib/mailer';

// Mock dependencies
jest.mock('../../lib/db', () => ({
  __esModule: true,
  db: {
    execute: jest.fn(),
    insert: jest.fn(),
    onConflict: jest.fn(),
    returning: jest.fn(),
  },
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: jest.fn(() => ({
      toString: jest.fn(() => 'mockResetToken'),
    })),
  };
});
jest.mock('../../lib/mailer', () => ({
  __esModule: true,
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Auth API', () => {
  beforeAll(async () => {
    await db.execute(sql`TRUNCATE TABLE "User", "RefreshToken" RESTART IDENTITY CASCADE`);
  });

  afterAll(async () => {
    await db.execute(sql`TRUNCATE TABLE "User", "RefreshToken" RESTART IDENTITY CASCADE`);
  });

  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE "User", "RefreshToken" RESTART IDENTITY CASCADE`);
  });

  describe('refresh', () => {
    it('should rotate refresh token and issue new access token', async () => {
      const req = { cookies: { refresh: 'old-refresh' } } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res), cookie: jest.fn() } as unknown as Response;

      const user = { id: '1', email: 'test@example.com', name: 'Test User', role: 'USER' };
      const tokenHash = require('crypto').createHash('sha256').update('old-refresh').digest('hex');

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [{ userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 10000), revokedAt: null }] });
      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [user] });
      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'rt2' }] });
      (db.execute as jest.Mock).mockResolvedValueOnce({});
      (jwt.sign as jest.Mock).mockReturnValue('new-access');

      await refresh(req, res);

      expect(db.execute).toHaveBeenCalledTimes(4);
      expect(res.cookie).toHaveBeenCalledWith('session', 'new-access', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh', expect.any(String), expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    });
  });

  describe('logout', () => {
    it('should revoke refresh and clear cookies', async () => {
      const req = { cookies: { refresh: 'to-revoke' } } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res), clearCookie: jest.fn() } as unknown as Response;
      const tokenHash = require('crypto').createHash('sha256').update('to-revoke').digest('hex');

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [{ tokenHash, revokedAt: null }] });
      (db.execute as jest.Mock).mockResolvedValueOnce({});

      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('session', expect.any(Object));
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
    });
  });

  describe('login', () => {
    it('should set cookies and return user for valid credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'password' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res), cookie: jest.fn() } as unknown as Response;
      const user = { id: '1', email: 'test@example.com', password: 'hashedPassword', name: 'Test User', role: 'USER' };

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [user] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('access-token');
      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'rt1' }] });

      await login(req, res);

      expect(res.cookie).toHaveBeenCalledWith('session', 'access-token', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh', expect.any(String), expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    });

    it('should return 401 for invalid credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrong-password' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [] });

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
      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [{ id: '1' }] });

      await registerAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Admin user created successfully' });
    });

    it('should return 400 if the user already exists', async () => {
      const req = { body: { email: 'admin@example.com', password: 'password', name: 'Admin' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (db.execute as jest.Mock).mockRejectedValue(new Error('User already exists'));

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

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [user] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      (db.execute as jest.Mock).mockResolvedValueOnce({});

      await changePassword(req, res);

      expect(db.execute).toHaveBeenCalledTimes(4);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password changed successfully' });
    });

    it('should return 401 for invalid current password', async () => {
      const req = {
        body: { currentPassword: 'wrongPassword', newPassword: 'newPassword123!' },
        user: { id: '1' }
      } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const user = { id: '1', password: 'hashedOldPassword' };

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [user] });
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

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [] }); // User not found

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

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [user] });
      (db.execute as jest.Mock).mockResolvedValueOnce({});

      await requestPasswordReset(req, res);

      expect(db.execute).toHaveBeenCalledTimes(3);
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      // SHA-256 hash of 'mockResetToken'
      const expectedHash = crypto.createHash('sha256').update('mockResetToken').digest('hex');
      expect(db.execute).toHaveBeenCalledWith(expect.stringContaining('UPDATE "User"'));
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If an account with that email exists, a password reset link has been sent.' });
    });

    it('should return 200 OK even for non-existent email for security reasons', async () => {
      const req = { body: { email: 'nonexistent@example.com' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await requestPasswordReset(req, res);

      expect(db.execute).toHaveBeenCalledTimes(1);
      expect(crypto.randomBytes).not.toHaveBeenCalled(); // Should not generate token
      expect(db.execute).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE "User"')); // Should not update user
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

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [user] });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      (db.execute as jest.Mock).mockResolvedValueOnce({});

      await resetPassword(req, res);

      expect(db.execute).toHaveBeenCalledTimes(3);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123!', 10);
      expect(db.execute).toHaveBeenCalledWith(expect.stringContaining('UPDATE "User"'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset successfully.' });
    });

    it('should return 400 for invalid or expired token (user not found by token)', async () => {
      const req = { body: { token: 'invalidToken', newPassword: 'newPassword123!' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [] }); // Token not found or expired

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired password reset token.' });
      expect(db.execute).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE "User"'));
    });

    it('should return 400 if no matching user found for provided token (mismatch)', async () => {
      const req = { body: { token: 'mismatchedToken', newPassword: 'newPassword123!' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      // Simulate that no user matches the hashed token
      (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired password reset token.' });
      expect(db.execute).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE "User"'));
    });
  });
});
