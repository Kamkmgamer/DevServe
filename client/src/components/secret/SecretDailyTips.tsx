import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

interface SecretDailyTipsProps {
  className?: string;
}

/**
 * SecretDailyTips - A beautifully styled Daily AI Tips section
 * This component is located in a secret/hidden location for security purposes
 * Features enhanced visual design with gradients, animations, and scroll interactions
 */
export const SecretDailyTips: React.FC<SecretDailyTipsProps> = ({ className = "" }) => {
  const [aiTip, setAiTip] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      } catch {
        console.log('Daily AI tip not available');
        setAiTip('AI features coming soon!');
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiTip();
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Animated Gradient Overlays */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-400/20 via-cyan-400/15 to-blue-400/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-tr from-purple-400/20 via-pink-400/15 to-rose-400/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>
      
      {/* Content Container with Scroll Animation */}
      <div className={`relative transition-all duration-1000 transform ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      }`}>
        {/* Animated Header */}
        <div className={`text-center mb-12 transition-all duration-1200 delay-200 ${
          isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping"></div>
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-slate-200 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
              Daily AI Tip
            </h2>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping delay-75"></div>
          </div>
          
          {/* Animated Underline */}
          <div className="mx-auto w-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 delay-500" 
               style={{ width: isVisible ? '96px' : '0px' }}>
          </div>
        </div>

        {/* Main Content Card with Hover Effects */}
        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-400 ${
          isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-6 opacity-0'
        }`}>
          <div className="relative group cursor-pointer">
            {/* Animated Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-gradient-xy blur-sm"></div>
            
            {/* Interactive Card */}
            <div className="relative bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-8 lg:p-12 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:border-blue-300/50 dark:group-hover:border-blue-600/50">
              
              {/* Loading State with Advanced Animation */}
              {isLoading && (
                <div className="flex items-center justify-center space-x-3 py-8">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium ml-4 animate-pulse">
                    Fetching your daily tip...
                  </span>
                </div>
              )}

              {/* Content with Staggered Animation */}
              {!isLoading && (
                <div className={`transition-all duration-800 delay-600 ${
                  isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
                }`}>
                  <div className="flex items-start space-x-6">
                    {/* Animated Quote Icon */}
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <svg className="w-7 h-7 text-white transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      {/* Tip Content with Gradient Text */}
                      <blockquote className="text-xl lg:text-2xl leading-relaxed font-medium bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 dark:from-slate-300 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 dark:group-hover:from-blue-400 dark:group-hover:via-purple-400 dark:group-hover:to-pink-400 transition-all duration-700">
                        {aiTip || 'Discover something new every day!'}
                      </blockquote>
                      
                      {/* Interactive Status Section */}
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 group-hover:border-blue-200/50 dark:group-hover:border-blue-600/50 transition-colors duration-500">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            hasError 
                              ? 'bg-red-400 shadow-red-400/50 shadow-lg animate-pulse' 
                              : 'bg-green-400 shadow-green-400/50 shadow-lg animate-pulse'
                          }`}></div>
                          <span className="text-sm font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-400 dark:to-slate-500 bg-clip-text text-transparent">
                            {hasError ? 'Offline Mode' : 'Powered by AI'}
                          </span>
                        </div>
                        
                        <div className="text-sm font-mono bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-400 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500">
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Animated Bottom Accent */}
        <div className={`flex justify-center mt-8 transition-all duration-1000 delay-800 ${
          isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
        }`}>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(90deg); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes gradient-xy {
          0%, 100% { 
            background-position: 0% 0%;
            background-size: 400% 400%;
          }
          50% { 
            background-position: 100% 100%;
            background-size: 200% 200%;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient 4s ease infinite;
        }
        
        .animate-gradient-xy {
          animation: gradient-xy 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default SecretDailyTips;
