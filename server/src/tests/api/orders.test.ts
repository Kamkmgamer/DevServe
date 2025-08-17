import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';

let token: string;
let userId: string;
let serviceId: string;
let orderId: string;

beforeAll(async () => {
  // Clean DB
  await prisma.orderLineItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.service.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.referral.deleteMany();

  // Create user and login
  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  const user = await prisma.user.create({ data: { email: 'order_user@example.com', password: hashedPassword, name: 'Buyer' } });
  userId = user.id;
  const loginRes = await request(app).post('/api/auth/login').send({ email: 'order_user@example.com', password: 'Test1234!' });
  token = loginRes.body.token;

  // Create a service
  const svc = await prisma.service.create({
    data: {
      name: 'Landing Page',
      description: 'Single-page site',
      price: 199,
      features: JSON.stringify(['design', 'dev']),
      category: 'Web',
      imageUrls: JSON.stringify(['a.jpg']),
    },
  });
  serviceId = svc.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Orders API', () => {
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
