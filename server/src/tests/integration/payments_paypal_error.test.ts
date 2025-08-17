import request from 'supertest';
import app from '../../app';

jest.mock('../../lib/paypal', () => ({
  createPayPalOrder: jest.fn(async () => { throw new Error('PayPal create failed'); }),
  capturePayPalOrder: jest.fn(async () => { throw new Error('PayPal capture failed'); }),
}));

describe('Payments - PayPal error paths', () => {
  beforeAll(() => {
    process.env.PAYPAL_CLIENT_ID = 'test';
    process.env.PAYPAL_CLIENT_SECRET = 'test';
  });

  it('returns 500 when PayPal create fails', async () => {
    const res = await request(app)
      .post('/api/payments/paypal/create')
      .send({ totalCents: 1200 });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 when PayPal capture fails', async () => {
    const res = await request(app)
      .post('/api/payments/paypal/capture')
      .send({ authorizationId: 'AUTH-FAIL', totalCents: 1200 });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
