import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ChatThreadList } from '@/components/chat/ChatThreadList';
import { useChatThreads, ChatMessage } from '@/hooks/useChatThreads';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const AgentChatScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    activeThreads,
    recentThreads,
    archivedThreads,
    searchQuery,
    setSearchQuery,
    createThread,
    addMessageToThread,
    updateMessageInThread,
    archiveThread,
    deleteThread,
    getThread,
  } = useChatThreads();

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const activeThread = activeThreadId ? getThread(activeThreadId) : null;
  const messages = activeThread?.messages || [];

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

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => scrollToBottom('auto'), 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNewChat = () => {
    setActiveThreadId(null);
    setShowQuickReplies(true);
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowQuickReplies(false);
  };

  const handleArchiveThread = (threadId: string) => {
    archiveThread(threadId);
    if (threadId === activeThreadId) {
      setActiveThreadId(null);
    }
    toast({
      title: 'Chat archived',
      description: 'The conversation has been moved to archived chats.',
    });
  };

  const handleDeleteThread = (threadId: string) => {
    deleteThread(threadId);
    if (threadId === activeThreadId) {
      setActiveThreadId(null);
    }
    toast({
      title: 'Chat deleted',
      description: 'The conversation has been permanently deleted.',
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    let threadId = activeThreadId;
    
    // Create new thread if none exists
    if (!threadId) {
      const newThread = createThread(inputValue.trim());
      threadId = newThread.id;
      setActiveThreadId(threadId);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Assalamu alaikum! I'm here to help you on your journey to find your life partner. What would you like to know?",
        timestamp: new Date(),
        status: 'sent',
      };
      addMessageToThread(threadId, welcomeMessage);
    }

    const messageId = `msg-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: messageId,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sending',
    };

    addMessageToThread(threadId, userMessage);
    setInputValue('');
    setShowQuickReplies(false);
    setIsLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = '44px';
    }

    // Simulate AI response
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      updateMessageInThread(threadId, messageId, { status: 'sent' });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: "I understand you're interested in that topic. Let me help you with some insights based on your profile and preferences. What specific aspect would you like to explore further?",
        timestamp: new Date(),
        status: 'sent',
      };
      
      addMessageToThread(threadId, assistantMessage);
      setIsLoading(false);
    } catch (error) {
      updateMessageInThread(threadId, messageId, { status: 'failed' });
      setIsLoading(false);
    }
  };

  const retryMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.status === 'failed') {
      setInputValue(message.content);
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
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
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

  // Show thread list if no active thread
  if (!activeThreadId) {
    return (
      <div className="relative h-screen flex flex-col bg-neutral-50">
        <TopBar
          variant="back"
          title="Talk to MMAgent"
          onBackClick={() => navigate('/myagent')}
        />
        <div 
          className="flex-1 overflow-hidden"
          style={{
            paddingTop: 'calc(56px + env(safe-area-inset-top))',
          }}
        >
          <ChatThreadList
            activeThreads={activeThreads}
            recentThreads={recentThreads}
            archivedThreads={archivedThreads}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onThreadSelect={handleThreadSelect}
            onNewChat={handleNewChat}
            onArchiveThread={handleArchiveThread}
            onDeleteThread={handleDeleteThread}
          />
        </div>
      </div>
    );
  }

  // Show chat interface for active thread
  return (
    <div className="relative h-screen flex flex-col bg-neutral-50">
      <TopBar
        variant="back"
        title={activeThread?.topic || 'Chat'}
        onBackClick={handleNewChat}
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
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-forest to-primary-gold flex items-center justify-center flex-shrink-0 text-lg">
                    🤖
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 relative group',
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border/50'
                  )}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    copyMessage(message.content);
                  }}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const timer = setTimeout(() => {
                      copyMessage(message.content);
                    }, 500);
                    e.currentTarget.addEventListener('touchend', () => clearTimeout(timer), {
                      once: true,
                    });
                  }}
                >
                  <p className={cn(
                    'text-sm leading-relaxed whitespace-pre-wrap break-words',
                    message.role === 'user' ? 'text-white' : 'text-foreground'
                  )}>
                    {message.content}
                  </p>

                  <div className={cn(
                    'flex items-center gap-2 mt-1',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}>
                    <span className={cn(
                      'text-xs',
                      message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    )}>
                      {formatTime(message.timestamp)}
                    </span>
                    
                    {message.role === 'user' && message.status && (
                      <span className="text-xs text-white/70">
                        {message.status === 'sending' && '○'}
                        {message.status === 'sent' && '✓'}
                        {message.status === 'failed' && (
                          <button
                            onClick={() => retryMessage(message.id)}
                            className="text-semantic-error hover:underline"
                          >
                            Retry
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-forest to-primary-gold flex items-center justify-center text-lg">
                🤖
              </div>
              <div className="bg-white border border-border/50 rounded-2xl px-4 py-2.5">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {showQuickReplies && messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 84px)' }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-muted-foreground mb-2 text-center">
              Quick actions
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply.value)}
                  className="px-4 py-2 bg-white border border-border/50 rounded-full text-sm hover:bg-muted/50 transition-colors active:scale-95"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/50"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask MMAgent anything..."
              className="flex-1 resize-none rounded-2xl border border-border/50 px-4 py-3 text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[44px] max-h-[120px]"
              rows={1}
              style={{ height: '44px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChatScreen;
