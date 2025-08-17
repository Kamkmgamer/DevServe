import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';

describe('Auth integration', () => {
  beforeAll(async () => {
    // Ensure DB is clean
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
    // Delete in dependency order to avoid FK issues
    await prisma.orderLineItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.service.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.commission.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.referral.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
  });

  it('POST /api/auth/register should create a user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Passw0rd!', name: 'Test User' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('POST /api/auth/login should return a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Passw0rd!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
