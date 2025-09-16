import fs from 'fs/promises';
import path from 'path';
import openai from './openai';
import logger from './logger';

export interface DailyTip {
  content: string;
  timestamp: number;
  expiresAt: number;
}

interface CacheData {
  currentTip: DailyTip | null;
  lastGenerated: number;
}

class DailyTipsCache {
  private cache: CacheData;
  private readonly cacheFilePath: string;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private isGenerating = false;
  private generationPromise: Promise<string> | null = null;
  private readonly persistToDisk: boolean;
  private refreshTimer?: NodeJS.Timeout;

  constructor() {
    this.cache = {
      currentTip: null,
      lastGenerated: 0,
    };
    
    // Decide persistence strategy
    // Default: persist in development; in production, only if explicitly enabled
    const envPersist = (process.env.DAILY_TIPS_PERSIST || '').toLowerCase();
    const nodeEnv = process.env.NODE_ENV || 'development';
    this.persistToDisk = envPersist === 'true' || (envPersist === '' && nodeEnv !== 'production');

    // Store cache file in server root directory
    this.cacheFilePath = path.join(__dirname, '../../daily-tips-cache.json');
    
    // Load cache on initialization (if persistence enabled)
    if (this.persistToDisk) {
      this.loadCache().catch(err => {
        logger.error('Failed to load daily tips cache on initialization:', err);
      });
    } else {
      logger.info('Daily tips cache persistence is disabled (memory-only)');
    }

    // Set up automatic daily refresh at midnight (skip in tests to avoid open handle leaks)
    const isTestEnv = (process.env.NODE_ENV === 'test') || !!process.env.JEST_WORKER_ID;
    if (!isTestEnv) {
      this.scheduleNextRefresh();
    } else {
      logger.info('Skipping daily tip auto-refresh scheduling in test environment');
    }
  }

  /**
   * Load cache from persistent storage
   */
  private async loadCache(): Promise<void> {
    if (!this.persistToDisk) return; // no-op when persistence disabled
    try {
      const data = await fs.readFile(this.cacheFilePath, 'utf-8');
      const parsed = JSON.parse(data) as CacheData;
      
      // Validate the cached data
      if (parsed.currentTip && parsed.currentTip.content && parsed.currentTip.timestamp) {
        this.cache = parsed;
        logger.info('Daily tips cache loaded from disk');
      } else {
        logger.warn('Invalid cache data found, will generate fresh tip');
      }
    } catch {
      // File doesn't exist or is corrupted - this is fine for first run
      logger.info('No existing daily tips cache found, will generate fresh tip');
    }
  }

  /**
   * Save cache to persistent storage
   */
  private async saveCache(): Promise<void> {
    if (!this.persistToDisk) return; // no-op when persistence disabled
    try {
      await fs.writeFile(this.cacheFilePath, JSON.stringify(this.cache, null, 2));
      logger.debug('Daily tips cache saved to disk');
    } catch (error) {
      logger.error('Failed to save daily tips cache:', error);
    }
  }

  /**
   * Check if the current cached tip is still valid
   */
  private isCacheValid(): boolean {
    if (!this.cache.currentTip) return false;
    
    const now = Date.now();
    return now < this.cache.currentTip.expiresAt;
  }

  /**
   * Calculate seconds until next midnight (UTC)
   */
  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(now.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
  }

  /**
   * Generate a fresh tip using OpenAI
   */
  private async generateFreshTip(): Promise<string> {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_open_router_api_key_here') {
      throw new Error('OpenRouter API key is not configured');
    }

    const prompts = [
      'Suggest a quick AI-powered code optimization technique that can be applied in under 10 minutes, with a specific example.',
      'Share a real-world AI integration tip for web or mobile apps that can improve user experience or performance.',
      'Give a short, developer-focused AI tip for debugging or troubleshooting machine learning models more effectively.',
      'Recommend a time-saving AI-powered developer tool that works well with modern frameworks like React, Vue, or Next.js.',
      'Provide a tip on using AI to automate repetitive coding or data processing tasks, with a practical example.',
      'Share a simple AI-driven productivity hack for developers that requires minimal setup.',
      'Suggest a quick AI experiment developers can try today to learn a new concept or tool hands-on.',
      'Explain a small but powerful AI technique that can enhance application security or reliability.',
      'Give a one-minute AI learning exercise that can expand a developer’s skillset in a fun way.',
      'Recommend an underrated AI library or API that can be integrated into a project within an hour.',
    ];


    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    try {
      const completion = await openai.chat.completions.create({
        model: 'openai/gpt-oss-20b:free',
        messages: [
          {
            role: 'system',
            content: 'You are an AI expert providing daily tips for developers. Your tips should be practical, actionable, and valuable. Format your response with markdown for emphasis (bold, italic, code blocks, links) when appropriate. Keep responses between 100-300 words.',
          },
          {
            role: 'user',
            content: randomPrompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.8,
      });

      const content = completion.choices[0].message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      logger.info('Successfully generated fresh daily tip');
      return content.trim();
    } catch (error: unknown) {
      const err = error as any;
      logger.error('Error generating fresh tip:', err?.response?.data || err?.message || err);
      
      // Re-throw with more specific error message
      if (err?.response?.status === 401) {
        throw new Error('Invalid OpenRouter API key. Please check your configuration.');
      } else if (err?.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error('Failed to generate fresh tip from OpenRouter API');
      }
    }
  }

  /**
   * Update the daily cache with a fresh tip
   */
  private async updateDailyCache(): Promise<void> {
    if (this.isGenerating) {
      // If we're already generating, wait for the existing promise
      if (this.generationPromise) {
        await this.generationPromise;
      }
      return;
    }

    this.isGenerating = true;
    
    try {
      this.generationPromise = this.generateFreshTip();
      const content = await this.generationPromise;
      
      const now = Date.now();
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      this.cache.currentTip = {
        content,
        timestamp: now,
        expiresAt: tomorrow.getTime(),
      };
      this.cache.lastGenerated = now;

      await this.saveCache();
      logger.info('Daily tip cache updated successfully');
    } finally {
      this.isGenerating = false;
      this.generationPromise = null;
    }
  }

  /**
   * Schedule the next automatic refresh at midnight UTC
   */
  private scheduleNextRefresh(): void {
    const msUntilMidnight = this.getSecondsUntilMidnight() * 1000;
    
    this.refreshTimer = setTimeout(() => {
      this.updateDailyCache().catch(err => {
        logger.error('Failed to auto-refresh daily tip at midnight:', err);
      });
      
      // Schedule the next refresh (24 hours later)
      this.scheduleNextRefresh();
    }, msUntilMidnight);

    logger.info(`Next daily tip refresh scheduled in ${Math.floor(msUntilMidnight / 1000 / 60)} minutes`);
  }

  /**
   * Get the current cached daily tip
   * If no valid cache exists, generate a new one
   */
  public async getCachedTip(): Promise<{ content: string; expiresIn: number }> {
    // If cache is invalid, update it
    if (!this.isCacheValid()) {
      await this.updateDailyCache();
    }

    if (!this.cache.currentTip) {
      throw new Error('Failed to generate daily tip');
    }

    const expiresIn = this.getSecondsUntilMidnight();
    
    return {
      content: this.cache.currentTip.content,
      expiresIn,
    };
  }

  /**
   * Generate and return a fresh tip (bypassing cache)
   * This does NOT update the daily cache
   */
  public async getFreshTip(): Promise<{ content: string; expiresIn: number }> {
    const content = await this.generateFreshTip();
    const expiresIn = this.getSecondsUntilMidnight();
    
    return {
      content,
      expiresIn,
    };
  }

  /**
   * Force refresh the daily cache
   * This updates the cached tip for all users
   */
  public async forceRefreshCache(): Promise<{ content: string; expiresIn: number }> {
    await this.updateDailyCache();
    return this.getCachedTip();
  }

  /**
   * Get cache statistics for debugging/monitoring
   */
  public getCacheStats(): {
    hasCache: boolean;
    lastGenerated: number;
    expiresAt: number | null;
    isValid: boolean;
    expiresIn: number;
  } {
    return {
      hasCache: !!this.cache.currentTip,
      lastGenerated: this.cache.lastGenerated,
      expiresAt: this.cache.currentTip?.expiresAt || null,
      isValid: this.isCacheValid(),
      expiresIn: this.getSecondsUntilMidnight(),
    };
  }

  /**
   * Get the last cached tip (for fallback purposes)
   * Returns null if no cache exists
   */
  public getLastCachedTip(): string | null {
    return this.cache.currentTip?.content || null;
  }
}

// Create singleton instance
const dailyTipsCache = new DailyTipsCache();

export default dailyTipsCache;
