import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { sign } from 'jsonwebtoken';

let token: string;
let userId: string;

beforeAll(async () => {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      password: 'password123',
      name: 'Test User',
    },
  });
  userId = user.id;

  // Generate a token
  token = sign({ id: userId, role: 'USER' }, process.env.JWT_SECRET || 'secret');
});

afterAll(async () => {
  // Clean up the database
  await prisma.referral.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
});

describe('Referral API', () => {
  it('should create a referral code for a logged-in user', async () => {
    const res = await request(app)
      .post('/api/referrals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'TESTCODE',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('code', 'TESTCODE');
  });

  it('should not allow a user to create more than one referral code', async () => {
    const res = await request(app)
      .post('/api/referrals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'ANOTHERCODE',
      });
    expect(res.statusCode).toEqual(400);
  });

  it('should get the referral code for the logged-in user', async () => {
    const res = await request(app)
      .get('/api/referrals/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('code', 'TESTCODE');
  });
});
