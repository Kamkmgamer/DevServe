import request from 'supertest';
import app from '../../app';
import { db } from '../../lib/db';
import * as schema from '../../lib/schema';
import { eq } from 'drizzle-orm';

describe('Auth integration', () => {
  beforeAll(async () => {
    await db.delete(schema.orderLineItems);
    await db.delete(schema.orders);
    await db.delete(schema.cartItems);
    await db.delete(schema.carts);
    await db.delete(schema.blogPosts);
    await db.delete(schema.services);
    await db.delete(schema.coupons);
    await db.delete(schema.commissions);
    await db.delete(schema.payouts);
    await db.delete(schema.referrals);
    await db.delete(schema.users);
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

  it('POST /api/auth/refresh should rotate refresh and set new cookies', async () => {
    // First, login to obtain cookies
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Passw0rd!' });
    expect(loginRes.status).toBe(200);
    const cookies = loginRes.headers['set-cookie'];

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(refreshRes.status).toBe(200);
    const setCookies = refreshRes.headers['set-cookie'] || [];
    const cookieStr2 = Array.isArray(setCookies) ? setCookies.join(';') : String(setCookies || '');
    expect(cookieStr2).toContain('session=');
    expect(cookieStr2).toContain('refresh=');
  });

  it('POST /api/auth/logout should clear cookies', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Passw0rd!' });
    const cookies = loginRes.headers['set-cookie'];

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(logoutRes.status).toBe(200);
    const clearedCookies = logoutRes.headers['set-cookie'] || [];
    const cookieStr3 = Array.isArray(clearedCookies) ? clearedCookies.join(';') : String(clearedCookies || '');
    // Should include Set-Cookie directives clearing session and refresh
    expect(cookieStr3).toContain('session=');
    expect(cookieStr3).toContain('refresh=');
  });
});
