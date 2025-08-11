import { Router } from 'express';
import { 
  getChatCompletion, 
  getDailyAiTip,
  getCachedDailyTip,
  getFreshDailyTip,
  getDailyTipStats,
  forceRefreshDailyTip
} from '../api/chatbot';

const router = Router();

// Chat completion endpoint
router.post('/chat', getChatCompletion);

// Daily tips endpoints
router.get('/daily-tip', getDailyAiTip);                    // Legacy endpoint (redirects to cached)
router.get('/daily-tip/cached', getCachedDailyTip);        // Server-side cached tip
router.get('/daily-tip/fresh', getFreshDailyTip);          // Fresh tip (bypasses cache)
router.get('/daily-tip/stats', getDailyTipStats);          // Cache statistics
router.post('/daily-tip/refresh', forceRefreshDailyTip);   // Force refresh cache

export default router;
