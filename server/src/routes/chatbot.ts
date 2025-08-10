import { Router } from 'express';
import { getChatCompletion, getDailyAiTip } from '../api/chatbot';

const router = Router();

router.post('/chat', getChatCompletion);
router.get('/daily-tip', getDailyAiTip);

export default router;