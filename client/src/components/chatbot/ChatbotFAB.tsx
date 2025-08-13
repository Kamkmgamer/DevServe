import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
// Lazy-load the heavy chatbot bundle only when actually opened
const EnhancedChatbot = React.lazy(() => import('./EnhancedChatbot'));

const ChatbotFAB: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Stable handlers to avoid re-renders in children
  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);

  // Preload the chatbot bundle on hover/focus for snappier open
  const preload = useCallback(() => {
    // Kick off the dynamic import without awaiting it
    import('./EnhancedChatbot');
  }, []);

  // Lightweight inline fallback to avoid importing global spinner
  const fallback = useMemo(() => (
    <div className="fixed bottom-6 right-6 z-50 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      Loading…
    </div>
  ), []);

  return (
    <>
      {/* Floating Action Button */}
      {!isChatOpen && (
        <button
          onClick={openChat}
          onMouseEnter={preload}
          onFocus={preload}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Enhanced Chatbot Component */}
      {isChatOpen && (
        <Suspense fallback={fallback}>
          <EnhancedChatbot isOpen={isChatOpen} onClose={closeChat} />
        </Suspense>
      )}
    </>
  );
};

export default ChatbotFAB;
