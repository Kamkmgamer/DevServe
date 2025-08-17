import request from 'supertest';
import app from '../../app';

describe('Payments route validation', () => {
  it('POST /api/payments/create-checkout-session should 400 on invalid body', async () => {
    const res = await request(app)
      .post('/api/payments/create-checkout-session')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('POST /api/payments/paypal/create should 400 when totalCents is missing', async () => {
    const res = await request(app)
      .post('/api/payments/paypal/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('POST /api/payments/paypal/capture should 400 when authorizationId is missing', async () => {
    const res = await request(app)
      .post('/api/payments/paypal/capture')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});
