import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { createTestUser } from '../helpers';
import { Role } from '@prisma/client';

describe('Referral API', () => {
  let adminUser: any;
  let regularUser: any;
  let referral: any;

  beforeAll(async () => {
    adminUser = await createTestUser('admin@example.com', 'password123', 'ADMIN');
    regularUser = await createTestUser('user@example.com', 'password123', 'USER');
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@example.com', 'user@example.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/referrals', () => {
    it('should create a referral code for a user', async () => {
      const res = await request(app)
        .post('/api/referrals')
        .set('Authorization', `Bearer ${regularUser.token}`)
        .send({
          code: 'TESTCODE',
          commissionRate: 0.1,
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('code', 'TESTCODE');
      referral = res.body;
    });

    it('should not allow a user to create more than one referral code', async () => {
        const res = await request(app)
            .post('/api/referrals')
            .set('Authorization', `Bearer ${regularUser.token}`)
            .send({
                code: 'TESTCODE2',
                commissionRate: 0.2,
            });
        expect(res.status).toBe(400);
    });
  });

  describe('GET /api/referrals/me', () => {
    it('should get the referral code for the current user', async () => {
      const res = await request(app)
        .get('/api/referrals/me')
        .set('Authorization', `Bearer ${regularUser.token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('code', 'TESTCODE');
    });
  });

  describe('PUT /api/referrals/:id', () => {
    it('should update the referral code for the current user', async () => {
      const res = await request(app)
        .put(`/api/referrals/${referral.id}`)
        .set('Authorization', `Bearer ${regularUser.token}`)
        .send({
          code: 'NEWTESTCODE',
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('code', 'NEWTESTCODE');
    });
  });

  describe('DELETE /api/referrals/:id', () => {
    it('should delete the referral code for the current user', async () => {
      const res = await request(app)
        .delete(`/api/referrals/${referral.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`);
      expect(res.status).toBe(204);
    });
  });
});