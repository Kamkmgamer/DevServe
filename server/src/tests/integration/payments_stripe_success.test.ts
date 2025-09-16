import request from 'supertest';
import app from '../../app';
import { db } from '../../lib/db';
import * as schema from '../../lib/schema';
import { eq } from 'drizzle-orm';

// Mock Stripe constructor before the handler dynamically requires it
// We mock the module export to a constructor function returning our mocked client
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://checkout.example/session' }),
      },
    },
  }));
});

describe('Payments - Stripe happy path', () => {
  let serviceId: string;

  beforeAll(async () => {
    process.env.CLIENT_URL = 'http://localhost:3000';
    // Ensure there's a service in DB for the route to find
    const service = await db.insert(schema.services).values({
      id: 'test-service-id' as any, // temp cast if uuid issue
      name: 'Test Service',
      description: 'A service for testing checkout',
      price: 123, // dollars
      features: JSON.stringify([]),
      category: 'Testing',
      imageUrls: JSON.stringify([]),
    }).returning({ id: schema.services.id });

    serviceId = service[0].id;
  });

  afterAll(async () => {
    await db.delete(schema.services).where(eq(schema.services.id, serviceId));
  });

  it('returns a checkout url on success', async () => {
    const res = await request(app)
      .post('/api/payments/create-checkout-session')
      .send({ serviceId, clientEmail: 'tester@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
    expect(res.body.url).toMatch(/^https:\/\/checkout\.example\/session/);
  });
});
