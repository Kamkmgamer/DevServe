import { Request, Response } from 'express';
import openai from '../lib/openai';

export const getChatCompletion = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-oss/gpt-4o-20b',
      messages: messages,
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('Error communicating with OpenRouter API:', error);
    res.status(500).json({ error: 'Failed to get chat completion from OpenRouter API' });
  }
};

export const getDailyAiTip = async (req: Request, res: Response) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-oss/gpt-4o-20b',
      messages: [
        { role: 'user', content: 'Give me a random, short, interesting AI tip of the day.' },
      ],
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('Error communicating with OpenRouter API:', error);
    res.status(500).json({ error: 'Failed to get daily AI tip from OpenRouter API' });
  }
};