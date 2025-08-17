import request from 'supertest';
import app from '../app';

describe('Validation middleware', () => {
  it('POST /api/chatbot/chat returns 400 for missing messages', async () => {
    const res = await request(app).post('/api/chatbot/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some((e: any) => e.location === 'body' && e.field === 'messages')).toBe(true);
  });

  it('POST /api/contact returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/contact').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    const fields = res.body.errors.map((e: any) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'subject', 'message']));
  });

  it('POST /api/payments/create-checkout-session returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/payments/create-checkout-session').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /api/payments/paypal/create returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/payments/paypal/create').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /api/payments/paypal/capture returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/payments/paypal/capture').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });
});
