import request from 'supertest';
import app from '../app';

describe('Validation middleware', () => {
  it('POST /api/chatbot/chat returns 400 for missing messages', async () => {
    const res = await request(app).post('/api/chatbot/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.message).toBe('Validation failed');
    expect(res.body.error).toHaveProperty('details');
    expect(Array.isArray(res.body.error.details.issues)).toBe(true);
    const paths = res.body.error.details.issues.map((i: any) => i.path?.[0]);
    expect(paths).toContain('messages');
  });

  it('POST /api/contact returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/contact').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
    const fields = res.body.error.details.issues.map((i: any) => i.path?.[0]);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'subject', 'message']));
  });

  it('POST /api/payments/create-checkout-session returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/payments/create-checkout-session').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });

  it('POST /api/payments/paypal/create returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/payments/paypal/create').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });

  it('POST /api/payments/paypal/capture returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/payments/paypal/capture').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });
});
