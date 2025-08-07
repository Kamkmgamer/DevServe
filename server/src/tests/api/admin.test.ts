import { getAdminDashboard } from '../../api/admin';
import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

// Mock the prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      count: jest.fn(),
    },
    service: {
      count: jest.fn(),
    },
    order: {
      count: jest.fn(),
    },
    cartItem: {
      count: jest.fn(),
    },
  },
}));

describe('Admin API', () => {
  it('should return the correct dashboard data', async () => {
    // Mock the prisma count functions
    (prisma.user.count as jest.Mock).mockResolvedValue(10);
    (prisma.service.count as jest.Mock).mockResolvedValue(5);
    (prisma.order.count as jest.Mock).mockResolvedValue(20);
    (prisma.cartItem.count as jest.Mock).mockResolvedValue(50);

    const req = {} as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    } as unknown as Response;

    await getAdminDashboard(req as any, res);

    expect(res.json).toHaveBeenCalledWith({
      userCount: 10,
      serviceCount: 5,
      orderCount: 20,
      cartItemCount: 50,
    });
  });
});