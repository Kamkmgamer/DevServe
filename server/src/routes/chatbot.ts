import { Router } from 'express';
import { 
  getChatCompletion, 
  getDailyAiTip,
  getCachedDailyTip,
  getFreshDailyTip,
  getDailyTipStats,
  forceRefreshDailyTip
} from '../api/chatbot';
import { validate } from '../middleware/validation';
import { chatCompletionSchema } from '../lib/validation';

const router = Router();

// Chat completion endpoint
router.post('/chat', validate(chatCompletionSchema), getChatCompletion);

// Daily tips endpoints
router.get('/daily-tip', getDailyAiTip);                    // Legacy endpoint (redirects to cached)
router.get('/daily-tip/cached', getCachedDailyTip);        // Server-side cached tip
router.get('/daily-tip/fresh', getFreshDailyTip);          // Fresh tip (bypasses cache)
router.get('/daily-tip/stats', getDailyTipStats);          // Cache statistics
router.post('/daily-tip/refresh', forceRefreshDailyTip);   // Force refresh cache

export default router;
