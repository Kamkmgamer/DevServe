import request from 'supertest';
import app from '../../app';

// Mock openai client used by chatbot API
jest.mock('../../lib/openai', () => ({
  __esModule: true,
  default: {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { role: 'assistant', content: 'Hello from mocked OpenRouter!' } }],
        }),
      },
    },
  },
}));

describe('Chatbot - chat completion happy path', () => {
  beforeAll(() => {
    process.env.OPENROUTER_API_KEY = 'test-key';
  });

  it('POST /api/chatbot/chat returns assistant message', async () => {
    const res = await request(app)
      .post('/api/chatbot/chat')
      .send({ messages: [{ role: 'user', content: 'Say hi' }] });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content', 'Hello from mocked OpenRouter!');
  });
});
