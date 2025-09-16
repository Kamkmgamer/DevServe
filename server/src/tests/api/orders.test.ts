import request from 'supertest';
import app from '../../app';
import { db } from '../../lib/db';
import * as schema from '../../lib/schema';
import jwt from 'jsonwebtoken';

describe('Orders API', () => {
  let userId: string;
  let serviceId: string;
  let token: string;
  let orderId: string;

  beforeAll(async () => {
    // Cleanup
    await db.delete(schema.orderLineItems);
    await db.delete(schema.orders);
    await db.delete(schema.cartItems);
    await db.delete(schema.carts);
    await db.delete(schema.services);
    await db.delete(schema.coupons);
    await db.delete(schema.users);
    await db.delete(schema.referrals);

    // Create user
    const userResult = await db.insert(schema.users).values({
      email: 'order_user@example.com',
      password: 'hashedPassword', // assume hashed
      name: 'Buyer',
    }).returning({ id: schema.users.id });

    userId = userResult[0].id;

    // Create token
    token = jwt.sign({ userId }, 'secret'); // assume secret

    // Create service
    const svcResult = await db.insert(schema.services).values({
      name: 'Test Service',
      description: 'Test',
      price: 100,
      features: JSON.stringify([]),
      category: 'Test',
      imageUrls: JSON.stringify([]),
    }).returning({ id: schema.services.id });

    serviceId = svcResult[0].id;
  });

  it('GET /api/orders requires auth', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('POST /api/orders validates payload (no items)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [], requirements: 'reqs' });
    expect(res.status).toBe(400);
  });

  it('POST /api/orders creates order without coupon', async () => {
    const payload = {
      items: [{ serviceId, quantity: 2 }],
      requirements: 'Please build my site',
    };
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(199 * 100 * 2);
    // The create order response does not include lineItems by default
    expect(typeof res.body.id).toBe('string');
    orderId = res.body.id;
  });

  it('GET /api/orders returns user orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/orders includes the created order with initial status', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const found = res.body.find((o: any) => o.id === orderId);
    expect(found).toBeTruthy();
    expect(found.status).toBe('PENDING');
  });

  it('POST /api/orders rejects invalid coupon', async () => {
    const payload = {
      items: [{ serviceId, quantity: 1 }],
      requirements: 'Another order',
      discount: { code: 'NOPE' },
    };
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid coupon/i);
  });
});
