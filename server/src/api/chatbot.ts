import { Request, Response } from 'express';
import openai from '../lib/openai';
import dailyTipsCache from '../lib/dailyTipsCache';
import logger from '../lib/logger';

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
      model: 'openai/gpt-oss-20b:free', // GPT OSS 20B - using gpt-4o-mini as a fallback since exact model ID needs verification
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.json(completion.choices[0].message);
  } catch (error: unknown) {
    const err = error as any;
    console.error(
      'Error communicating with OpenRouter API:',
      err?.response?.data || err?.message || err
    );
    
    // Provide more specific error messages
    if (err?.response?.status === 401) {
      res.status(500).json({ 
        error: 'Invalid OpenRouter API key. Please check your configuration.' 
      });
    } else if (err?.response?.status === 429) {
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

/**
 * Get cached daily AI tip (server-side caching)
 * Returns the same tip to all users for the current day
 */
export const getCachedDailyTip = async (req: Request, res: Response) => {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_open_router_api_key_here') {
      logger.warn('OpenRouter API key is not configured');
      return res.status(500).json({
        error: 'Chatbot service is not configured. Please add your OpenRouter API key.',
        content: '**AI features coming soon!** Configure your *OpenRouter API key* to enable daily tips with rich text support including `code snippets` and [setup instructions](https://openrouter.ai).',
        expiresIn: Math.floor((new Date().setUTCHours(24, 0, 0, 0) - Date.now()) / 1000)
      });
    }

    const result = await dailyTipsCache.getCachedTip();
    
    res.json({
      content: result.content,
      tip: result.content, // For backward compatibility
      expiresIn: result.expiresIn
    });
    
    logger.info('Served cached daily tip');
  } catch (error: unknown) {
    const err = error as any;
    logger.error('Error getting cached daily tip:', err?.message || err);
    
    // Try to get the last cached tip as fallback
    const fallbackTip = dailyTipsCache.getLastCachedTip();
    const expiresIn = Math.floor((new Date().setUTCHours(24, 0, 0, 0) - Date.now()) / 1000);
    
    if (fallbackTip) {
      logger.info('Serving fallback cached tip due to error');
      return res.json({
        content: fallbackTip,
        tip: fallbackTip,
        expiresIn,
        warning: 'Serving cached tip due to temporary service issue'
      });
    }
    
    // Final fallback
    res.status(500).json({
      error: 'Failed to get daily AI tip',
      content: '**AI Tip:** *Stay curious and keep learning!* Every day brings new opportunities to grow your skills with `artificial intelligence` and [modern development tools](https://github.com).',
      tip: '**AI Tip:** *Stay curious and keep learning!* Every day brings new opportunities to grow your skills with `artificial intelligence` and [modern development tools](https://github.com).',
      expiresIn
    });
  }
};

/**
 * Get fresh AI tip (bypasses cache)
 * Always generates a new tip, doesn't affect the daily cached tip
 */
export const getFreshDailyTip = async (req: Request, res: Response) => {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_open_router_api_key_here') {
      logger.warn('OpenRouter API key is not configured for fresh tip request');
      return res.status(500).json({
        error: 'Chatbot service is not configured. Please add your OpenRouter API key.',
        content: '**Fresh AI tip requires configuration!** Set up your *OpenRouter API key* to unlock unlimited fresh tips with `real-time generation` and [API access](https://openrouter.ai).',
        expiresIn: Math.floor((new Date().setUTCHours(24, 0, 0, 0) - Date.now()) / 1000)
      });
    }

    const result = await dailyTipsCache.getFreshTip();
    
    res.json({
      content: result.content,
      tip: result.content, // For backward compatibility
      expiresIn: result.expiresIn,
      fresh: true
    });
    
    logger.info('Served fresh daily tip');
  } catch (error: unknown) {
    const err = error as any;
    logger.error('Error getting fresh daily tip:', err?.message || err);
    
    // Try to get the cached tip as fallback for fresh requests
    try {
      const fallbackResult = await dailyTipsCache.getCachedTip();
      logger.info('Serving cached tip as fallback for fresh tip request');
      return res.json({
        content: fallbackResult.content,
        tip: fallbackResult.content,
        expiresIn: fallbackResult.expiresIn,
        warning: 'Serving cached tip due to fresh generation failure'
      });
    } catch (fallbackError) {
      logger.error('Fallback to cached tip also failed:', fallbackError);
    }
    
    // Final fallback with error-specific messages
    const expiresIn = Math.floor((new Date().setUTCHours(24, 0, 0, 0) - Date.now()) / 1000);
    let errorMessage = 'Failed to generate fresh AI tip';
    let fallbackContent = '**Fresh AI Tip:** *Embrace failure as a learning opportunity!* When APIs fail, having robust `fallback mechanisms` helps maintain [user experience](https://ux.design).';
    
    if (typeof err?.message === 'string' && err.message.includes('Rate limit')) {
      errorMessage = 'Rate limit exceeded for fresh tips';
      fallbackContent = '**Rate Limited:** *Patience is a virtue in API development!* Implement `exponential backoff` and respect [rate limits](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) for better reliability.';
    } else if (typeof err?.message === 'string' && err.message.includes('API key')) {
      errorMessage = 'API configuration issue';
      fallbackContent = '**Configuration Tip:** *Proper API key management is crucial!* Store credentials securely using `environment variables` and check [API documentation](https://openrouter.ai/docs) for setup.';
    }
    
    res.status(500).json({
      error: errorMessage,
      content: fallbackContent,
      tip: fallbackContent,
      expiresIn
    });
  }
};

/**
 * Legacy endpoint - redirects to cached tip for backward compatibility
 * @deprecated Use /daily-tip/cached instead
 */
export const getDailyAiTip = async (req: Request, res: Response) => {
  logger.info('Legacy daily-tip endpoint called, redirecting to cached version');
  return getCachedDailyTip(req, res);
};

/**
 * Get cache statistics (for debugging/monitoring)
 */
export const getDailyTipStats = async (req: Request, res: Response) => {
  try {
    const stats = dailyTipsCache.getCacheStats();
    
    res.json({
      ...stats,
      message: 'Daily tips cache statistics',
      timestamp: new Date().toISOString()
    });
    
    logger.info('Served daily tip cache statistics');
  } catch (error: unknown) {
    const err = error as any;
    logger.error('Error getting cache stats:', err?.message || err);
    res.status(500).json({
      error: 'Failed to get cache statistics',
      message: err?.message || 'Unknown error'
    });
  }
};

/**
 * Force refresh the daily cache (admin/debugging endpoint)
 */
export const forceRefreshDailyTip = async (req: Request, res: Response) => {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_open_router_api_key_here') {
      return res.status(500).json({
        error: 'Chatbot service is not configured. Please add your OpenRouter API key.'
      });
    }

    const result = await dailyTipsCache.forceRefreshCache();
    
    res.json({
      content: result.content,
      tip: result.content,
      expiresIn: result.expiresIn,
      message: 'Daily tip cache forcefully refreshed',
      refreshed: true
    });
    
    logger.info('Daily tip cache forcefully refreshed via API');
  } catch (error: unknown) {
    const err = error as any;
    logger.error('Error force refreshing daily tip cache:', err?.message || err);
    res.status(500).json({
      error: 'Failed to force refresh daily tip cache',
      message: err?.message || 'Unknown error'
    });
  }
};
