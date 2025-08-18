import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';

describe('Auth integration', () => {
  beforeAll(async () => {
    // Ensure DB is clean (delete in dependency order to avoid FK issues)
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
  });

  it('POST /api/auth/register should create a user and set cookies', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Passw0rd!', name: 'Test User' });

    expect(res.status).toBe(201);
    // Body contains user object
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    // Cookies set: session (access) and refresh
    const cookies = res.headers['set-cookie'] || [];
    const cookieStr = Array.isArray(cookies) ? cookies.join(';') : String(cookies || '');
    expect(cookieStr).toContain('session=');
    expect(cookieStr).toContain('refresh=');
  });

  it('POST /api/auth/login should set cookies and return user for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Passw0rd!' });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    const cookies = res.headers['set-cookie'] || [];
    const cookieStr = Array.isArray(cookies) ? cookies.join(';') : String(cookies || '');
    expect(cookieStr).toContain('session=');
    expect(cookieStr).toContain('refresh=');
  });
});
