import request from 'supertest';
import { Express } from 'express';
import dailyTipsCache from '../../lib/dailyTipsCache';
import logger from '../../lib/logger';

// Mock the logger to avoid console spam during tests
jest.mock('../../lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock the daily tips cache
jest.mock('../../lib/dailyTipsCache', () => ({
  getCachedTip: jest.fn(),
  getFreshTip: jest.fn(),
  getCacheStats: jest.fn(),
  forceRefreshCache: jest.fn(),
  getLastCachedTip: jest.fn(),
}));

// Mock OpenAI module
jest.mock('../../lib/openai', () => ({
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
}));

// Import app after mocks are set up
import app from '../../app';

describe('Daily Tips API', () => {
  const mockDailyTipsCache = dailyTipsCache as jest.Mocked<typeof dailyTipsCache>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up mock environment
    process.env.OPENROUTER_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/chatbot/daily-tip/cached', () => {
    it('should return cached daily tip successfully', async () => {
      const mockTip = {
        content: '**Test Tip:** This is a *test* tip with `code` and [links](https://example.com).',
        expiresIn: 86400
      };

      mockDailyTipsCache.getCachedTip.mockResolvedValue(mockTip);

      const response = await request(app)
        .get('/api/chatbot/daily-tip/cached')
        .expect(200);

      expect(response.body).toEqual({
        content: mockTip.content,
        tip: mockTip.content,
        expiresIn: mockTip.expiresIn
      });

      expect(mockDailyTipsCache.getCachedTip).toHaveBeenCalledTimes(1);
    });

    it('should return fallback tip when cache fails', async () => {
      const mockFallbackTip = 'Fallback tip content';
      
      mockDailyTipsCache.getCachedTip.mockRejectedValue(new Error('Cache error'));
      mockDailyTipsCache.getLastCachedTip.mockReturnValue(mockFallbackTip);

      const response = await request(app)
        .get('/api/chatbot/daily-tip/cached')
        .expect(200);

      expect(response.body.content).toBe(mockFallbackTip);
      expect(response.body.warning).toContain('temporary service issue');
    });

    it('should return configuration error when API key is not set', async () => {
      process.env.OPENROUTER_API_KEY = 'your_open_router_api_key_here';

      const response = await request(app)
        .get('/api/chatbot/daily-tip/cached')
        .expect(500);

      expect(response.body.error).toContain('not configured');
      expect(response.body.content).toContain('AI features coming soon');
    });
  });

  describe('GET /api/chatbot/daily-tip/fresh', () => {
    it('should return fresh daily tip successfully', async () => {
      const mockTip = {
        content: '**Fresh Tip:** This is a *fresh* tip with `new content`.',
        expiresIn: 86400
      };

      mockDailyTipsCache.getFreshTip.mockResolvedValue(mockTip);

      const response = await request(app)
        .get('/api/chatbot/daily-tip/fresh')
        .expect(200);

      expect(response.body).toEqual({
        content: mockTip.content,
        tip: mockTip.content,
        expiresIn: mockTip.expiresIn,
        fresh: true
      });

      expect(mockDailyTipsCache.getFreshTip).toHaveBeenCalledTimes(1);
    });

    it('should fallback to cached tip when fresh generation fails', async () => {
      const mockCachedTip = {
        content: 'Cached fallback tip',
        expiresIn: 86400
      };

      mockDailyTipsCache.getFreshTip.mockRejectedValue(new Error('Generation error'));
      mockDailyTipsCache.getCachedTip.mockResolvedValue(mockCachedTip);

      const response = await request(app)
        .get('/api/chatbot/daily-tip/fresh')
        .expect(200);

      expect(response.body.content).toBe(mockCachedTip.content);
      expect(response.body.warning).toContain('fresh generation failure');
    });

    it('should return rate limit specific error message', async () => {
      mockDailyTipsCache.getFreshTip.mockRejectedValue(new Error('Rate limit exceeded'));
      mockDailyTipsCache.getCachedTip.mockRejectedValue(new Error('Cache also failed'));

      const response = await request(app)
        .get('/api/chatbot/daily-tip/fresh')
        .expect(500);

      expect(response.body.error).toContain('Rate limit exceeded');
      expect(response.body.content).toContain('Rate Limited');
    });
  });

  describe('GET /api/chatbot/daily-tip/stats', () => {
    it('should return cache statistics', async () => {
      const mockStats = {
        hasCache: true,
        lastGenerated: Date.now(),
        expiresAt: Date.now() + 86400000,
        isValid: true,
        expiresIn: 86400
      };

      mockDailyTipsCache.getCacheStats.mockReturnValue(mockStats);

      const response = await request(app)
        .get('/api/chatbot/daily-tip/stats')
        .expect(200);

      expect(response.body).toEqual({
        ...mockStats,
        message: 'Daily tips cache statistics',
        timestamp: expect.any(String)
      });
    });

    it('should handle stats retrieval error', async () => {
      mockDailyTipsCache.getCacheStats.mockImplementation(() => {
        throw new Error('Stats error');
      });

      const response = await request(app)
        .get('/api/chatbot/daily-tip/stats')
        .expect(500);

      expect(response.body.error).toBe('Failed to get cache statistics');
    });
  });

  describe('POST /api/chatbot/daily-tip/refresh', () => {
    it('should force refresh the cache successfully', async () => {
      const mockRefreshedTip = {
        content: 'Newly refreshed tip',
        expiresIn: 86400
      };

      mockDailyTipsCache.forceRefreshCache.mockResolvedValue(mockRefreshedTip);

      const response = await request(app)
        .post('/api/chatbot/daily-tip/refresh')
        .expect(200);

      expect(response.body).toEqual({
        content: mockRefreshedTip.content,
        tip: mockRefreshedTip.content,
        expiresIn: mockRefreshedTip.expiresIn,
        message: 'Daily tip cache forcefully refreshed',
        refreshed: true
      });
    });

    it('should return error when API key is not configured', async () => {
      process.env.OPENROUTER_API_KEY = 'your_open_router_api_key_here';

      const response = await request(app)
        .post('/api/chatbot/daily-tip/refresh')
        .expect(500);

      expect(response.body.error).toContain('not configured');
    });
  });

  describe('GET /api/chatbot/daily-tip (Legacy)', () => {
    it('should redirect to cached endpoint', async () => {
      const mockTip = {
        content: 'Legacy endpoint tip',
        expiresIn: 86400
      };

      mockDailyTipsCache.getCachedTip.mockResolvedValue(mockTip);

      const response = await request(app)
        .get('/api/chatbot/daily-tip')
        .expect(200);

      expect(response.body.content).toBe(mockTip.content);
      expect(mockDailyTipsCache.getCachedTip).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Response Format', () => {
    it('should always include required fields in cached response', async () => {
      const mockTip = {
        content: 'Test content',
        expiresIn: 12345
      };

      mockDailyTipsCache.getCachedTip.mockResolvedValue(mockTip);

      const response = await request(app)
        .get('/api/chatbot/daily-tip/cached')
        .expect(200);

      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('tip'); // Backward compatibility
      expect(response.body).toHaveProperty('expiresIn');
      expect(typeof response.body.expiresIn).toBe('number');
    });

    it('should always include required fields in fresh response', async () => {
      const mockTip = {
        content: 'Fresh content',
        expiresIn: 12345
      };

      mockDailyTipsCache.getFreshTip.mockResolvedValue(mockTip);

      const response = await request(app)
        .get('/api/chatbot/daily-tip/fresh')
        .expect(200);

      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('tip'); // Backward compatibility
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body).toHaveProperty('fresh', true);
      expect(typeof response.body.expiresIn).toBe('number');
    });
  });
});
