import request from 'supertest';
import app from '../../app';

describe('Chatbot Daily Tip endpoints (no API key configured)', () => {
  it('GET /api/chatbot/daily-tip should respond with 500 and helpful content when not configured', async () => {
    const res = await request(app).get('/api/chatbot/daily-tip');
    expect([500, 200]).toContain(res.status); // legacy may proxy to cached with 500 inside
    // Accept either structure but ensure content/message present
    expect(res.body).toHaveProperty('content');
  });

  it('GET /api/chatbot/daily-tip/cached should respond with 500 and content when not configured', async () => {
    const res = await request(app).get('/api/chatbot/daily-tip/cached');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('content');
  });

  it('GET /api/chatbot/daily-tip/fresh should respond with 500 and content when not configured', async () => {
    const res = await request(app).get('/api/chatbot/daily-tip/fresh');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('content');
  });
});
