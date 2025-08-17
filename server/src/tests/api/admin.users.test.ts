import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';

let adminToken: string;
let createdUserId: string;

beforeAll(async () => {
  // Clean tables in dependency order to avoid FK violations
  await prisma.orderLineItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.user.deleteMany();

  // Seed an admin user and login
  const hashedPassword = await bcrypt.hash('Admin1234!', 10);
  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', password: hashedPassword, name: 'Admin', role: 'ADMIN' as any },
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'Admin1234!' });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Admin Users API', () => {
  it('GET /api/admin/users should require admin (we have admin)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/admin/users validates payload', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'badonly@example.com' }); // missing password
    expect(res.status).toBe(400);
  });

  it('POST /api/admin/users creates a user', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'newuser@example.com', password: 'Passw0rd!', name: 'New User', role: 'USER' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('newuser@example.com');
    createdUserId = res.body.id;
  });

  it('GET /api/admin/users/:id returns the user', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
  });

  it('PUT /api/admin/users/:id updates fields', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });
});
