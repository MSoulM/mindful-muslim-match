import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ThreadList, ThreadType, Thread } from '@/components/chat/ThreadList';
import { ChatView, ChatMessage } from '@/components/chat/ChatView';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { Button } from '@/components/ui/button';
import { useChatGestures } from '@/hooks/useChatGestures';
import { useChatPerformance } from '@/hooks/useChatPerformance';
import { toast } from 'sonner';
import { useAgentName } from '@/hooks/useAgentName';
import { useAuth } from '@clerk/clerk-react';
import {
  getMMAgentSessions,
  createMMAgentSession,
  getMMAgentMessages,
  sendMMAgentMessage,
  type MMAgentSession,
  type MMAgentMessage
} from '@/services/api/mmagent';

interface SessionWithMessages extends MMAgentSession {
  messages: ChatMessage[];
}

export default function AgentChatScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentThreadId = searchParams.get('threadId');
  const { getToken } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('myagent');
  const [sessions, setSessions] = useState<SessionWithMessages[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const customAgentName = useAgentName();

  const {
    trackMessageSend,
    trackThreadSwitch,
    trackInitialLoad
  } = useChatPerformance();

  const mapMessageToChatMessage = (msg: MMAgentMessage): ChatMessage => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    status: 'sent' as const
  });

  const loadSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const token = await getToken();
      
      if (!token) {
        toast.error('Please sign in to access MMAgent chat');
        return;
      }
      
      const dbSessions = await getMMAgentSessions(token);
      
      const sessionsWithMessages: SessionWithMessages[] = await Promise.all(
        dbSessions.map(async (session) => {
          if (!session.id || !session.id.trim()) {
            console.warn('Skipping session with invalid ID:', session);
            return {
              ...session,
              messages: []
            };
          }
          
          try {
            const messages = await getMMAgentMessages(token, session.id);
            return {
              ...session,
              messages: messages.map(mapMessageToChatMessage)
            };
          } catch (error) {
            console.error(`Failed to load messages for session ${session.id}:`, error);
            return {
              ...session,
              messages: []
            };
          }
        })
      );

      setSessions(sessionsWithMessages);
      
      const endLoad = trackInitialLoad();
      const totalMessages = sessionsWithMessages.reduce((sum, s) => sum + s.messages.length, 0);
      endLoad({
        messageCount: totalMessages,
        threadCount: sessionsWithMessages.length
      });
    } catch (error) {
      console.error('Failed to load sessions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
      
      if (errorMessage.includes('not available') || errorMessage.includes('Failed to send')) {
        toast.error('MMAgent functions not deployed. Please deploy edge functions to Supabase.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoadingSessions(false);
    }
  }, [getToken, trackInitialLoad]);

  const loadMessagesForSession = useCallback(async (sessionId: string) => {
    if (!sessionId || !sessionId.trim()) {
      console.error('Invalid session ID provided');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('No authentication token available');
        return;
      }
      
      const messages = await getMMAgentMessages(token, sessionId);
      
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: messages.map(mapMessageToChatMessage) }
          : s
      ));
    } catch (error) {
      console.error('Failed to load messages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      toast.error(errorMessage);
    }
  }, [getToken]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (currentThreadId) {
      loadMessagesForSession(currentThreadId);
    }
  }, [currentThreadId, loadMessagesForSession]);

  const convertToThreadListFormat = (): Thread[] => {
    return sessions
      .filter(s => s.is_active)
      .map(s => ({
        id: s.id,
        type: (s.topic as ThreadType) || 'custom',
        title: s.title || 'New conversation',
        lastMessage: s.messages.length > 0 
          ? s.messages[s.messages.length - 1].content 
          : 'No messages yet',
        lastMessageAt: s.last_message_at ? new Date(s.last_message_at) : new Date(s.created_at),
        unreadCount: 0,
        isArchived: !s.is_active,
        createdAt: new Date(s.created_at)
      }));
  };

  const handleNewThread = useCallback(async (type: ThreadType) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Please sign in to create a conversation');
        return;
      }
      
      const newSession = await createMMAgentSession(
        token,
        'New conversation',
        type
      );
      
      const sessionWithMessages: SessionWithMessages = {
        ...newSession,
        messages: []
      };
      
      setSessions(prev => [sessionWithMessages, ...prev]);
      setSearchParams({ threadId: newSession.id });
      toast.success('New conversation started');
    } catch (error) {
      console.error('Failed to create session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      toast.error(errorMessage);
    }
  }, [getToken, setSearchParams]);

  const handleThreadSelect = useCallback((threadId: string) => {
    const endTrack = trackThreadSwitch();
    setSearchParams({ threadId });
    requestAnimationFrame(() => endTrack(threadId));
  }, [setSearchParams, trackThreadSwitch]);

  const handleArchiveThread = useCallback(async (threadId: string) => {
    try {
      setSessions(prev => prev.map(s => 
        s.id === threadId ? { ...s, is_active: false } : s
      ));
      toast.success('Thread archived');
      if (currentThreadId === threadId) {
        setSearchParams({});
      }
    } catch (error) {
      console.error('Failed to archive thread:', error);
      toast.error('Failed to archive conversation');
    }
  }, [currentThreadId, setSearchParams]);

  const handleDeleteThread = useCallback(async (threadId: string) => {
    try {
      setSessions(prev => prev.filter(s => s.id !== threadId));
      toast.success('Thread deleted');
      if (currentThreadId === threadId) {
        setSearchParams({});
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
      toast.error('Failed to delete conversation');
    }
  }, [currentThreadId, setSearchParams]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentThreadId) return;

    if (!content || !content.trim()) {
      console.warn('Attempted to send empty message');
      return;
    }

    const session = sessions.find(s => s.id === currentThreadId);
    if (!session) return;

    const endTrack = trackMessageSend();

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending'
    };

    setSessions(prev => prev.map(s => 
      s.id === currentThreadId 
        ? { ...s, messages: [...s.messages, userMessage] }
        : s
    ));

    requestAnimationFrame(() => {
      endTrack({ success: true });
    });

    try {
      setIsTyping(true);
      const token = await getToken();
      if (!token) {
        throw new Error('Please sign in to send messages');
      }
      
      const response = await sendMMAgentMessage(token, currentThreadId, content);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        status: 'sent'
      };

      setSessions(prev => prev.map(s => 
        s.id === currentThreadId 
          ? { 
              ...s, 
              messages: s.messages
                .map(m => m.id === userMessage.id ? { ...m, status: 'sent' as const } : m)
                .concat(assistantMessage),
              message_count: s.message_count + 2,
              last_message_at: new Date().toISOString()
            }
          : s
      ));

      if (response.deflection) {
        toast.info(response.deflection);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      
      setSessions(prev => prev.map(s => 
        s.id === currentThreadId 
          ? { ...s, messages: s.messages.filter(m => m.id !== userMessage.id) }
          : s
      ));
      
      endTrack({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsTyping(false);
    }
  }, [currentThreadId, sessions, getToken, setIsTyping, trackMessageSend]);

  // Handle going back from chat view
  const handleBack = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadSessions();
      if (currentThreadId) {
        await loadMessagesForSession(currentThreadId);
      }
      toast.success('Chat refreshed');
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadSessions, loadMessagesForSession, currentThreadId]);

  const currentThread = currentThreadId 
    ? sessions.find(s => s.id === currentThreadId)
    : null;

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
        const message = currentThread.messages.find(m => m.id === messageId);
        if (message) {
          toast.success('Message marked as important');
        }
      }
    }
  });

  return (
    <div className="relative min-h-screen bg-background" {...swipeHandlers}>
      <TopBar 
        variant="back" 
        title={currentThread ? (currentThread.title || 'New conversation') : (customAgentName || "MMAgent Chat")}
        onBackClick={currentThread ? handleBack : () => navigate('/myagent')}
      />
      
      <ScreenContainer
        hasTopBar
        hasBottomNav={!currentThread}
        padding={false}
        scrollable={false}
        className="h-[calc(100vh-56px)] overflow-hidden"
      >
        <div className="h-full">
          <PullToRefresh onRefresh={handleRefresh}>
            {currentThread ? (
              <ChatView
                threadId={currentThread.id}
                threadType={(currentThread.topic as ThreadType) || 'custom'}
                threadTitle={currentThread.title || 'New conversation'}
                messages={currentThread.messages}
                onSendMessage={handleSendMessage}
                onArchive={() => handleArchiveThread(currentThread.id)}
                onDelete={() => handleDeleteThread(currentThread.id)}
                onToggleImportant={(messageId) => {
                  toast.info('Message importance feature coming soon');
                }}
                messageGestures={messageGestures}
                isTyping={isTyping}
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
                isLoading={isLoadingSessions}
              />
            )}
          </PullToRefresh>
        </div>
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

      {/* Bottom Navigation - only show when on thread list */}
      {!currentThread && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            if (tabId === 'discover') navigate('/discover');
            else if (tabId === 'myagent') navigate('/myagent');
            else if (tabId === 'dna') navigate('/dna');
            else if (tabId === 'chaichat') navigate('/chaichat');
            else if (tabId === 'messages') navigate('/messages');
          }}
        />
      )}
    </div>
  );
}
