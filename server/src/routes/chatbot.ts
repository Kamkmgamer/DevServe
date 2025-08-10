import { Router } from 'express';
import { getChatCompletion } from '../api/chatbot';

const router = Router();

router.post('/chat', getChatCompletion);

export default router;
