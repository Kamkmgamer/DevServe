import request from 'supertest';
import app from '../../app';
import { db } from '../../lib/db';
import * as schema from '../../lib/schema';
import bcrypt from 'bcryptjs';

let adminToken: string;
let createdUserId: string;

beforeAll(async () => {
  await db.delete(schema.orderLineItems);
  await db.delete(schema.orders);
  await db.delete(schema.cartItems);
  await db.delete(schema.carts);
  await db.delete(schema.commissions);
  await db.delete(schema.payouts);
  await db.delete(schema.blogPosts);
  await db.delete(schema.referrals);
  await db.delete(schema.users);
  await db.delete(schema.portfolios);

  // Seed an admin user and login
  const hashedPassword = await bcrypt.hash('Admin1234!', 10);
  await db.insert(schema.users).values({
    id: 'test-admin-id',
    email: 'admin@example.com',
    password: hashedPassword, // assume hashed
    name: 'Admin User',
    role: 'ADMIN',
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'Admin1234!' });
  adminToken = loginRes.body.token;
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
