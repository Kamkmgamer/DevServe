import request from 'supertest';
import app from '../../app';
import { db } from '../../lib/db';
import * as schema from '../../lib/schema';
import bcrypt from 'bcryptjs';

let token: string;
let couponId: string;

beforeAll(async () => {
  await db.delete(schema.orderLineItems);
  await db.delete(schema.orders);
  await db.delete(schema.cartItems);
  await db.delete(schema.carts);
  await db.delete(schema.coupons);
  await db.delete(schema.users);

  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  await db.insert(schema.users).values({
    email: 'coupon_admin@example.com',
    password: hashedPassword,
    name: 'Admin',
    role: 'ADMIN'
  });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'coupon_admin@example.com', password: 'Test1234!' });
  token = res.body.token;
});

describe('Coupons API', () => {
  describe('Public: GET /api/coupons/code/:code', () => {
    it('returns 404 for invalid code', async () => {
      const res = await request(app).get('/api/coupons/code/NOPE');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(typeof res.body.error.message).toBe('string');
    });
  });

  describe('Admin: create/update/delete', () => {
    it('POST /api/coupons rejects unauthenticated', async () => {
      const res = await request(app).post('/api/coupons').send({});
      expect(res.status).toBe(401);
    });

    it('POST /api/coupons validates body', async () => {
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'ONLY_CODE' }); // missing fields
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('POST /api/coupons creates a coupon', async () => {
      const payload = {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrderAmount: 1000,
        maxUses: 5,
        active: true,
      };
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ code: 'WELCOME10', value: 10, active: true });
      couponId = res.body.id;
    });

    it('GET /api/coupons/code/:code returns the coupon', async () => {
      const res = await request(app).get('/api/coupons/code/WELCOME10');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe('WELCOME10');
    });

    it('PATCH /api/coupons/:id updates a coupon', async () => {
      const res = await request(app)
        .patch(`/api/coupons/${couponId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ value: 15 });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(15);
    });

    it('GET /api/coupons returns paginated list', async () => {
      const res = await request(app).get('/api/coupons?page=1&pageSize=10');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('total');
    });

    it('DELETE /api/coupons/:id deletes the coupon', async () => {
      const res = await request(app)
        .delete(`/api/coupons/${couponId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    it('GET /api/coupons/:id returns 404 after deletion', async () => {
      const res = await request(app).get(`/api/coupons/${couponId}`);
      expect(res.status).toBe(404);
    });
  });
});
