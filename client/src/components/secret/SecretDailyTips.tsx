import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

interface SecretDailyTipsProps {
  className?: string;
}

/**
 * SecretDailyTips - A beautifully styled Daily AI Tips section
 * This component is located in a secret/hidden location for security purposes
 * Features enhanced visual design with gradients, shadows, and responsive layout
 */
export const SecretDailyTips: React.FC<SecretDailyTipsProps> = ({ className = "" }) => {
  const [aiTip, setAiTip] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchAiTip = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Use a custom axios instance without the global error handler for this non-critical request
        const response = await api.get('/chatbot/daily-tip', {
          // Disable global error handling for this request
          validateStatus: () => true
        });
        
        if (response.status === 200 && response.data.content) {
          setAiTip(response.data.content);
        } else {
          // Use the fallback message from the server if available
          setAiTip(response.data.content || 'AI features coming soon! Configure your OpenRouter API key to enable.');
        }
      } catch (error: unknown) {
        console.log('Daily AI tip not available');
        setAiTip('AI features coming soon!');
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiTip();
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl transform -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-lg transform translate-x-12 translate-y-12"></div>
      
      <div className="relative">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-slate-200 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Daily AI Tip
            </h2>
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto"></div>
        </div>

        {/* Tip Content Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Card Shadow and Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            
            {/* Main Card */}
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-8 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-500">
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium ml-3">
                    Fetching your daily tip...
                  </span>
                </div>
              )}

              {/* Tip Content */}
              {!isLoading && (
                <>
                  {/* Quote Icon */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <blockquote className="text-lg lg:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                        {aiTip || 'Discover something new every day!'}
                      </blockquote>
                      
                      {/* Status Indicator */}
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            hasError 
                              ? 'bg-red-400 animate-pulse' 
                              : 'bg-green-400 animate-pulse'
                          }`}></div>
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {hasError ? 'Offline Mode' : 'Powered by AI'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-400 dark:text-slate-500 font-mono">
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Accent */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretDailyTips;
