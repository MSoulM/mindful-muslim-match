import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

const AgentChatScreen = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Assalamu alaikum Ahmed! I'm here to help you on your journey to find your life partner. What would you like to know?",
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    },
    {
      id: '2',
      role: 'user',
      content: "What should I know about Sarah before our chat?",
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
    },
    {
      id: '3',
      role: 'assistant',
      content: "Great question! Based on your ChaiChat conversation, Sarah values work-life balance and has a wonderful sense of humor. She mentioned loving hiking and reading - perhaps ask about her favorite trails or recent books. She appreciates depth in conversation, so don't hesitate to share your genuine thoughts. Your 95% compatibility suggests natural conversation flow. Be yourself - that's who she matched with! 😊",
      timestamp: new Date(Date.now() - 30000), // 30 seconds ago
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const quickReplies = [
    { id: '1', text: '🎯 My Matches', value: 'Tell me about my matches' },
    { id: '2', text: '📈 Improve Profile', value: 'How can I improve my profile?' },
    { id: '3', text: '💡 Get Advice', value: 'I need some advice' },
    { id: '4', text: '💑 Compatibility', value: 'What makes a good match?' },
    { id: '5', text: '🤔 Ask Anything', value: '' },
  ];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  // Handle keyboard showing/hiding
  useEffect(() => {
    const handleResize = () => {
      // Scroll to bottom when keyboard appears
      setTimeout(() => scrollToBottom('auto'), 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // Show a brief toast or feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setShowQuickReplies(false);
    setIsLoading(true);

    // Auto-resize textarea back to default
    if (inputRef.current) {
      inputRef.current.style.height = '44px';
    }

    // Update status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'sent' as const } : msg
        )
      );
    }, 300);

    // Simulate AI response (replace with actual API call)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Update to delivered
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'delivered' as const } : msg
        )
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I understand you're interested in that topic. Let me help you with some insights based on your profile and preferences. What specific aspect would you like to explore further?",
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      // Handle error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'error' as const } : msg
        )
      );
      setIsLoading(false);
    }
  };

  const retryMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.status === 'error') {
      setInputValue(message.content);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setTimeout(() => handleSend(), 100);
    }
  };

  const handleQuickReply = (value: string) => {
    if (!value) {
      inputRef.current?.focus();
      return;
    }
    setInputValue(value);
    setShowQuickReplies(false);
    // Auto-send quick reply
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-grow textarea
    e.target.style.height = '44px';
    const scrollHeight = e.target.scrollHeight;
    e.target.style.height = Math.min(scrollHeight, 120) + 'px';
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="relative h-screen flex flex-col bg-neutral-50">
      <TopBar
        variant="back"
        title="Talk to MMAgent"
        onBackClick={() => navigate('/myagent')}
      />

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-20"
        style={{
          paddingTop: 'calc(56px + env(safe-area-inset-top) + 16px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Agent Avatar */}
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-forest to-primary-gold flex items-center justify-center flex-shrink-0 text-lg">
                    🤖
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={cn(
                    'flex flex-col',
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}
                  style={{ maxWidth: '85%' }}
                >
                  <div
                    onContextMenu={(e) => {
                      e.preventDefault();
                      copyMessage(message.content);
                    }}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      const timer = setTimeout(() => {
                        copyMessage(message.content);
                      }, 500);
                      
                      const clearTimer = () => {
                        clearTimeout(timer);
                        document.removeEventListener('touchend', clearTimer);
                        document.removeEventListener('touchmove', clearTimer);
                      };
                      
                      document.addEventListener('touchend', clearTimer);
                      document.addEventListener('touchmove', clearTimer);
                    }}
                    className={cn(
                      'px-4 py-3 break-words cursor-pointer select-text',
                      message.role === 'assistant'
                        ? 'bg-white rounded-2xl rounded-tl-sm shadow-sm'
                        : 'bg-gradient-to-br from-primary-forest to-primary-forest/90 text-white rounded-2xl rounded-br-sm',
                      message.status === 'error' && 'opacity-60'
                    )}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  
                  {/* Timestamp and Status */}
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[11px] text-neutral-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.role === 'user' && message.status && (
                      <>
                        {message.status === 'sending' && (
                          <span className="text-[11px] text-neutral-400">●</span>
                        )}
                        {message.status === 'sent' && (
                          <span className="text-[11px] text-neutral-500">✓</span>
                        )}
                        {message.status === 'delivered' && (
                          <span className="text-[11px] text-primary-forest">✓✓</span>
                        )}
                        {message.status === 'error' && (
                          <button
                            onClick={() => retryMessage(message.id)}
                            className="text-[11px] text-semantic-error hover:underline"
                          >
                            Retry
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-forest to-primary-gold flex items-center justify-center flex-shrink-0 text-lg">
                🤖
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-neutral-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-neutral-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-neutral-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Reply Pills */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white border-t border-neutral-200 px-4 py-3 overflow-x-auto"
            style={{
              bottom: 'calc(68px + env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex gap-2 max-w-2xl mx-auto">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply.value)}
                  className="flex-shrink-0 px-4 py-2 bg-white border-2 border-neutral-200 rounded-full text-sm font-medium text-neutral-700 hover:border-primary-forest active:scale-95 transition-all whitespace-nowrap"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 z-50"
        style={{
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          {/* Input Field */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-3xl text-[15px] resize-none focus:outline-none focus:border-primary-forest transition-colors"
            style={{ height: '44px' }}
          />

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'w-11 h-11 rounded-full bg-gradient-to-br from-primary-forest to-primary-forest/90 flex items-center justify-center shadow-md transition-all',
              (!inputValue.trim() || isLoading) && 'opacity-50'
            )}
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Send className="w-5 h-5 text-white" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatScreen;
