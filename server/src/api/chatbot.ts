import { Request, Response } from 'express';
import axios from 'axios';

export const getChatCompletion = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
    }

    const lmStudioUrl = process.env.LM_STUDIO_API_URL || 'http://localhost:1234/v1/chat/completions';
    const modelName = process.env.LM_STUDIO_MODEL_NAME || 'Qwen3-0.6B'; // Default model name

    const response = await axios.post(lmStudioUrl, {
      model: modelName,
      messages: messages,
      temperature: 0.7, // Adjustable parameter
      max_tokens: 150, // Adjustable parameter
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with LM Studio API:', error);
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        error: 'Failed to get chat completion from LM Studio API',
        details: error.response?.data || error.message,
      });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
};
