import request from 'supertest';
import app from '../../app';

// Mock the PayPal lib functions used by the handlers
jest.mock('../../lib/paypal', () => ({
  createPayPalOrder: jest.fn(async (totalCents: number) => ({
    id: 'ORDER-123',
    status: 'CREATED',
    amount: { value: (totalCents / 100).toFixed(2), currency_code: 'USD' },
  })),
  capturePayPalOrder: jest.fn(async (authorizationId: string) => ({
    id: authorizationId,
    status: 'COMPLETED',
  })),
}));

describe('Payments - PayPal happy paths', () => {
  beforeAll(() => {
    process.env.PAYPAL_CLIENT_ID = 'test';
    process.env.PAYPAL_CLIENT_SECRET = 'test';
  });

  it('POST /api/payments/paypal/create returns order on success', async () => {
    const res = await request(app)
      .post('/api/payments/paypal/create')
      .send({ totalCents: 2599 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'CREATED' });
  });

  it('POST /api/payments/paypal/capture returns capture result on success', async () => {
    const res = await request(app)
      .post('/api/payments/paypal/capture')
      .send({ authorizationId: 'AUTH-123', totalCents: 2599 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'AUTH-123', status: 'COMPLETED' });
  });
});
