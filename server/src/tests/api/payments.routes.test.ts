import request from 'supertest';
import app from '../../app';

// Mock PayPal utilities used by the routes
jest.mock('../../lib/paypal', () => ({
  createPayPalOrder: jest.fn(async (totalCents: number) => ({ id: 'ORDER123', amount: totalCents })),
  capturePayPalOrder: jest.fn(async (authorizationId: string) => ({ id: authorizationId, status: 'COMPLETED' })),
}));

const { createPayPalOrder, capturePayPalOrder } = jest.requireMock('../../lib/paypal');

describe('Payments routes (integration)', () => {
  it('POST /api/payments/paypal/create should validate body and return order', async () => {
    const res = await request(app)
      .post('/api/payments/paypal/create')
      .send({ totalCents: 12345 });

    expect(res.status).toBe(200);
    expect(createPayPalOrder).toHaveBeenCalledWith(12345);
    expect(res.body).toEqual({ id: 'ORDER123', amount: 12345 });
  });

  it('POST /api/payments/paypal/capture should validate body and return capture result', async () => {
    const res = await request(app)
      .post('/api/payments/paypal/capture')
      .send({ authorizationId: 'AUTH456' });

    expect(res.status).toBe(200);
    expect(capturePayPalOrder).toHaveBeenCalledWith('AUTH456');
    expect(res.body).toEqual({ id: 'AUTH456', status: 'COMPLETED' });
  });
});
