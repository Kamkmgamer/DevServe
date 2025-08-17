import request from 'supertest';
import app from '../app';

describe('JSON parse error handling', () => {
  it('returns standardized 400 error for invalid JSON body', async () => {
    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name":"John"'); // malformed JSON (missing closing brace)

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toBe('Invalid JSON payload');
    expect(res.body.error).toHaveProperty('details');
  });
});
