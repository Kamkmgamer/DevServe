import { getAdminDashboard } from '../../api/admin';
import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { users } from '../../lib/schema';
import { eq, sql } from 'drizzle-orm';

// Mock the db client
jest.mock('../../lib/db', () => ({
  __esModule: true,
  db: {
    execute: jest.fn(),
    insert: jest.fn(),
    select: jest.fn(),
  },
}));

describe('Admin API', () => {
  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`);
  });

  it('should return the correct dashboard data', async () => {
    // Mock the db queries
    (db.select as jest.Mock).mockReturnValueOnce([
      { count: 10 },
      { count: 5 },
      { count: 20 },
      { count: 50 },
    ]);

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