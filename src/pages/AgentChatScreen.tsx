import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ThreadList, ThreadType, Thread } from '@/components/chat/ThreadList';
import { ChatView, ChatMessage } from '@/components/chat/ChatView';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { Button } from '@/components/ui/button';
import { useChatStore, type Thread as StoreThread, type Message as StoreMessage } from '@/store/chatStore';
import { useTextChat } from '@/hooks/useTextChat';
import { useChatGestures } from '@/hooks/useChatGestures';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { useChatPerformance } from '@/hooks/useChatPerformance';
import { useDebouncedTyping } from '@/hooks/useDebouncedTyping';
import { toast } from 'sonner';
import { useAgentName } from '@/hooks/useAgentName';

export default function AgentChatScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentThreadId = searchParams.get('threadId');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const customAgentName = useAgentName();
  
  // Connect to chatStore
  const threads = useChatStore((state) => state.threads);
  const addThread = useChatStore((state) => state.addThread);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const archiveThread = useChatStore((state) => state.archiveThread);
  const removeThread = useChatStore((state) => state.removeThread);
  const getThread = useChatStore((state) => state.getThread);
  const isTyping = useChatStore((state) => state.isTyping);
  const setIsTyping = useChatStore((state) => state.setIsTyping);
  const connectionStatus = useChatStore((state) => state.connectionStatus);

  const { sendMessage, isLoading } = useTextChat();
  
  // Initialize WebSocket connection and sync state to store
  const { connect: connectWebSocket } = useChatWebSocket();

  // Performance tracking
  const {
    trackMessageSend,
    trackThreadSwitch,
    trackInitialLoad
  } = useChatPerformance();

  // Debounced typing indicator (200ms target)
  const { handleTypingStart, handleTypingStop } = useDebouncedTyping({
    onStartTyping: () => setIsTyping(true),
    onStopTyping: () => setIsTyping(false),
    delay: 1000
  });

  // Track initial load
  useEffect(() => {
    const endLoad = trackInitialLoad();
    const timer = setTimeout(() => {
      endLoad({
        messageCount: threads.reduce((sum, t) => sum + t.messages.length, 0),
        threadCount: threads.length
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Connect WebSocket on mount (optional - for future real-time features)
  // useEffect(() => {
  //   const WS_URL = `wss://${window.location.hostname}/ws/chat`;
  //   connectWebSocket(WS_URL);
  // }, [connectWebSocket]);

  // Convert store thread format to ThreadList format
  const convertToThreadListFormat = (): Thread[] => {
    return threads
      .filter(t => !t.isArchived)
      .map(t => ({
        id: t.id,
        type: t.type as ThreadType,
        title: t.topic,
        lastMessage: t.messages.length > 0 
          ? t.messages[t.messages.length - 1].content 
          : 'No messages yet',
        lastMessageAt: t.updatedAt,
        unreadCount: t.unreadCount,
        isArchived: t.isArchived,
        createdAt: t.createdAt
      }));
  };

  // Handle creating a new thread
  const handleNewThread = useCallback((type: ThreadType) => {
    const newThread: StoreThread = {
      id: `thread-${Date.now()}`,
      type: type,
      topic: 'New conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
      unreadCount: 0
    };
    addThread(newThread);
    setSearchParams({ threadId: newThread.id });
    toast.success('New conversation started');
  }, [addThread, setSearchParams]);

  // Handle selecting a thread
  const handleThreadSelect = useCallback((threadId: string) => {
    const endTrack = trackThreadSwitch();
    setSearchParams({ threadId });
    requestAnimationFrame(() => endTrack(threadId));
  }, [setSearchParams, trackThreadSwitch]);

  // Handle archiving a thread
  const handleArchiveThread = useCallback((threadId: string) => {
    archiveThread(threadId);
    toast.success('Thread archived');
    if (currentThreadId === threadId) {
      setSearchParams({});
    }
  }, [archiveThread, currentThreadId, setSearchParams]);

  // Handle deleting a thread
  const handleDeleteThread = useCallback((threadId: string) => {
    removeThread(threadId);
    toast.success('Thread deleted');
    if (currentThreadId === threadId) {
      setSearchParams({});
    }
  }, [removeThread, currentThreadId, setSearchParams]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentThreadId) return;

    const thread = getThread(currentThreadId);
    if (!thread) return;

    // Track message send performance
    const endTrack = trackMessageSend();

    // Add user message immediately (optimistic update)
    const userMessage: StoreMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending'
    };
    addMessage(currentThreadId, userMessage);

    // Complete visual feedback within 500ms
    requestAnimationFrame(() => {
      endTrack({ success: true });
    });

    try {
      setIsTyping(true);
      
      // Get full conversation history for context
      const conversationHistory = [
        ...thread.messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user' as const, content }
      ];

      // Call Claude API with full context
      const response = await sendMessage(content, conversationHistory);

      // Add assistant response
      const assistantMessage: StoreMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        status: 'sent'
      };
      addMessage(currentThreadId, assistantMessage);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      endTrack({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsTyping(false);
    }
  }, [currentThreadId, getThread, addMessage, sendMessage, setIsTyping, trackMessageSend]);

  // Handle going back from chat view
  const handleBack = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success('Chat refreshed');
  }, []);

  // Get current thread for chat view
  const currentThread = currentThreadId ? getThread(currentThreadId) : null;

  // Chat gesture handlers
  const { swipeHandlers, messageGestures } = useChatGestures({
    onSwipeRight: currentThread ? handleBack : undefined,
    onSwipeLeft: currentThread ? () => handleArchiveThread(currentThread.id) : undefined,
    onLongPress: (messageId) => {
      toast.info('Message options', {
        description: 'Long press detected on message',
        action: {
          label: 'Close',
          onClick: () => {}
        }
      });
    },
    onDoubleTap: (messageId) => {
      if (currentThread) {
        // Toggle important flag
        const message = currentThread.messages.find(m => m.id === messageId);
        if (message) {
          updateMessage(
            currentThread.id, 
            messageId, 
            { isImportant: !message.isImportant }
          );
          toast.success(message.isImportant ? 'Unmarked as important' : 'Marked as important');
        }
      }
    }
  });

  return (
    <div className="relative min-h-screen bg-background" {...swipeHandlers}>
      <TopBar 
        variant="back" 
        title={currentThread ? currentThread.topic : (customAgentName || "MMAgent Chat")}
        onBackClick={currentThread ? handleBack : () => navigate(-1)}
      />
      
      {/* Connection status banner */}
      {connectionStatus !== 'connected' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className={cn(
            "px-4 py-2 text-xs flex items-center justify-center gap-2",
            connectionStatus === 'reconnecting' && "bg-amber-50 text-amber-800 border-b border-amber-100",
            connectionStatus === 'offline' && "bg-red-50 text-red-800 border-b border-red-100"
          )}
        >
          <div className={cn(
            "h-2 w-2 rounded-full",
            connectionStatus === 'reconnecting' && "bg-amber-500 animate-pulse",
            connectionStatus === 'offline' && "bg-red-500"
          )} />
          <span>
            {connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}
          </span>
        </motion.div>
      )}
      
      <ScreenContainer
        hasTopBar
        hasBottomNav={!currentThread} // Hide bottom nav in chat view
        padding={false}
        scrollable={false}
        className="h-[calc(100vh-56px)]"
      >
        <PullToRefresh onRefresh={handleRefresh}>
          {currentThread ? (
            <ChatView
              threadId={currentThread.id}
              threadType="custom"
              threadTitle={currentThread.topic}
              messages={currentThread.messages}
              onSendMessage={handleSendMessage}
              onArchive={() => handleArchiveThread(currentThread.id)}
              onDelete={() => handleDeleteThread(currentThread.id)}
              onToggleImportant={(messageId) => {
                const message = currentThread.messages.find(m => m.id === messageId);
                if (message) {
                  updateMessage(
                    currentThread.id,
                    messageId,
                    { isImportant: !message.isImportant }
                  );
                }
              }}
              messageGestures={messageGestures}
              isTyping={isTyping || isLoading}
              quickReplies={currentThread.messages.length === 0 ? [
                'Tell me about my matches',
                'How can I improve my profile?',
                'What makes a good match?'
              ] : []}
            />
          ) : (
            <ThreadList
              threads={convertToThreadListFormat()}
              onThreadSelect={handleThreadSelect}
              onNewThread={handleNewThread}
              onArchiveThread={handleArchiveThread}
              onDeleteThread={handleDeleteThread}
              isLoading={false}
            />
          )}
        </PullToRefresh>
      </ScreenContainer>

      {/* Floating Action Button for New Thread (only on thread list) */}
      <AnimatePresence>
        {!currentThread && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 right-4 z-50"
          >
            <Button
              size="lg"
              onClick={() => handleNewThread('custom')}
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
