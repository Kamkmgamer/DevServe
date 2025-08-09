import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

let token: string;
let serviceId: string;

beforeAll(async () => {
  // Clean slate in an order that respects foreign key constraints
  await prisma.orderLineItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.service.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.portfolioItem.deleteMany();

  // Create admin user and log in to get token
  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  await prisma.user.create({ data: { email: 'a@a.com', password: hashedPassword, name: 'Admin' } });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'a@a.com', password: 'Test1234!' });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Services API', () => {
  describe('POST /api/services', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/services').send({});
      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid data', async () => {
      const payload = { name: 'Invalid' }; // Missing required fields
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should create a service with a valid JWT', async () => {
      const payload = {
        name: 'TestSvc',
        description: 'Desc',
        price: 100,
        features: ['f1', 'f2'],
        category: 'Portfolio',
        imageUrls: ['image1.jpg', 'image2.jpg'], // Added imageUrls
      };
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'TestSvc', price: 100 });
      serviceId = res.body.id; // Save for later tests
    });
  });

  describe('GET /api/services', () => {
    it('should return an array with the created service', async () => {
      const res = await request(app).get('/api/services');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('TestSvc');
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return the correct service', async () => {
      const res = await request(app).get(`/api/services/${serviceId}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('TestSvc');
    });

    it('should return 404 for a non-existent service', async () => {
      const res = await request(app).get('/api/services/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/services/:id', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).patch(`/api/services/${serviceId}`).send({ name: 'Updated' });
      expect(res.status).toBe(401);
    });

    it('should update the service', async () => {
      const payload = { name: 'Updated TestSvc', price: 150 };
      const res = await request(app)
        .patch(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated TestSvc');
      expect(res.body.price).toBe(150);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).delete(`/api/services/${serviceId}`);
      expect(res.status).toBe(401);
    });

    it('should delete the service', async () => {
      const res = await request(app)
        .delete(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app).get(`/api/services/${serviceId}`);
      expect(res.status).toBe(404);
    });
  });
});