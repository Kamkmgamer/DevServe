import request from 'supertest';
import app from '../../app';

// Mock the dailyTipsCache used by the API to avoid real OpenRouter calls
const getCachedTip = jest.fn(async () => ({ content: 'Cached tip content', expiresIn: 3600 }));
const getFreshTip = jest.fn(async () => ({ content: 'Fresh tip content', expiresIn: 3590 }));

jest.mock('../../lib/dailyTipsCache', () => ({
  __esModule: true,
  default: {
    getCachedTip,
    getFreshTip,
  },
}));

describe('Chatbot - daily tips happy paths', () => {
  beforeAll(() => {
    // ensure API key check passes inside the handlers
    process.env.OPENROUTER_API_KEY = 'test-key';
  });

  it('GET /api/chatbot/daily-tip/cached returns cached tip', async () => {
    const res = await request(app).get('/api/chatbot/daily-tip/cached');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ content: 'Cached tip content' });
    expect(getCachedTip).toHaveBeenCalled();
  });

  it('GET /api/chatbot/daily-tip/fresh returns fresh tip', async () => {
    const res = await request(app).get('/api/chatbot/daily-tip/fresh');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ content: 'Fresh tip content', fresh: true });
    expect(getFreshTip).toHaveBeenCalled();
  });
});
