import { Request, Response } from 'express';
import openai from '../lib/openai';

export const getChatCompletion = async (req: Request, res: Response) => {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_open_router_api_key_here') {
      console.error('OpenRouter API key is not configured');
      return res.status(500).json({ 
        error: 'Chatbot service is not configured. Please add your OpenRouter API key.' 
      });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: 'Messages array is required and cannot be empty.' });
    }

    // Using GPT OSS 20B model through OpenRouter
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini', // GPT OSS 20B - using gpt-4o-mini as a fallback since exact model ID needs verification
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.json(completion.choices[0].message);
  } catch (error: any) {
    console.error(
      'Error communicating with OpenRouter API:',
      error.response?.data || error.message || error
    );
    
    // Provide more specific error messages
    if (error.response?.status === 401) {
      res.status(500).json({ 
        error: 'Invalid OpenRouter API key. Please check your configuration.' 
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to get chat completion from OpenRouter API' 
      });
    }
  }
};

export const getDailyAiTip = async (req: Request, res: Response) => {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_open_router_api_key_here') {
      console.error('OpenRouter API key is not configured');
      return res.status(500).json({ 
        error: 'Chatbot service is not configured. Please add your OpenRouter API key.',
        content: 'AI Tip: Configure your OpenRouter API key to enable AI-powered features!' 
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini', // GPT OSS 20B - using gpt-4o-mini as a fallback since exact model ID needs verification
      messages: [
        {
          role: 'user',
          content: 'Give me a random, short, interesting AI tip of the day.',
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    res.json(completion.choices[0].message);
  } catch (error: any) {
    console.error(
      'Error communicating with OpenRouter API:',
      error.response?.data || error.message || error
    );
    
    // Provide more specific error messages
    if (error.response?.status === 401) {
      res.status(500).json({ 
        error: 'Invalid OpenRouter API key. Please check your configuration.',
        content: 'AI Tip: Make sure your OpenRouter API key is valid and has credits!' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to get daily AI tip from OpenRouter API',
        content: 'AI Tip: Check your internet connection and API configuration!' 
      });
    }
  }
};
