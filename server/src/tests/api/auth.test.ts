
import { login, registerAdmin } from '../../api/auth';
import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth API', () => {
  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'password' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const user = { id: '1', password: 'hashedPassword' };

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
});
