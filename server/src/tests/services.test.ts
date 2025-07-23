import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

let token: string;

beforeAll(async () => {
  // clean slate
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  // create admin & login
  const hashed = await bcrypt.hash('Test1234!', 10);
  await prisma.user.create({ data: { email: 'a@a.com', password: hashed } });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'a@a.com', password: 'Test1234!' });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/services', () => {
  it('returns empty array', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/services', () => {
  it('creates service with valid JWT', async () => {
    const payload = {
      name: 'TestSvc',
      description: 'Desc',
      price: 100,
      features: ['f1', 'f2'],
      category: 'Portfolio'
    };
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'TestSvc', price: 100 });
  });
});