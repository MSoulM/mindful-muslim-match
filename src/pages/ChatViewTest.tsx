import { useState } from 'react';
import { ChatView, ChatMessage } from '@/components/chat/ChatView';
import { ThreadType } from '@/components/chat/ThreadList';
import { useToast } from '@/hooks/use-toast';
import { TopBar } from '@/components/layout/TopBar';

const ChatViewTest = () => {
  const { toast } = useToast();
  const [threadType] = useState<ThreadType>('match_discussion');
  const [threadTitle] = useState('Discussing Match: Sarah A.');
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Assalamu Alaikum! I\'ve been analyzing your compatibility with Sarah A. and I have some insights to share.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'read',
      isImportant: false
    },
    {
      id: '2',
      role: 'user',
      content: 'Wa Alaikum Salaam! I\'m very interested. What did you find?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000),
      status: 'read',
      isImportant: false
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Based on your MySoulDNA profiles:\n\n• Values DNA match: 87% - Both prioritize family and faith\n• Lifestyle DNA: 82% - Similar daily routines and prayer commitment\n• Goals DNA: 79% - Aligned career and family aspirations\n\nThis is a strong overall compatibility of 83%.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 120000),
      status: 'read',
      isImportant: true
    },
    {
      id: '4',
      role: 'user',
      content: 'That sounds promising! What about communication style?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      status: 'delivered',
      isImportant: false
    },
    {
      id: '5',
      role: 'assistant',
      content: 'Excellent question! Your Behavioral DNA analysis shows:\n\n• You both prefer thoughtful, deep conversations\n• Similar conflict resolution approaches\n• Complementary communication patterns\n\nSarah tends to be more direct, while you\'re more reflective - this can create good balance.',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      status: 'read',
      isImportant: false
    },
    {
      id: '6',
      role: 'user',
      content: 'What would be a good first conversation topic?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'sent',
      isImportant: false
    }
  ]);

  const [quickReplies] = useState([
    'Tell me more about compatibility',
    'What are potential challenges?',
    'How should I reach out?'
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
      isImportant: false
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg
      ));

      // Simulate MMAgent typing
      setIsTyping(true);
      setTimeout(() => {
        const response: ChatMessage = {
          id: `msg-${Date.now()}-reply`,
          role: 'assistant',
          content: 'That\'s a great question! Let me help you with that...',
          timestamp: new Date(),
          status: 'read',
          isImportant: false
        };
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 2000);
    }, 500);

    toast({
      title: 'Message Sent',
      description: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
    });
  };

  const handleArchive = () => {
    toast({
      title: 'Chat Archived',
      description: `"${threadTitle}" has been archived`,
    });
  };

  const handleDelete = () => {
    toast({
      title: 'Chat Deleted',
      description: `"${threadTitle}" has been deleted`,
      variant: 'destructive',
    });
  };

  const handleToggleImportant = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isImportant: !msg.isImportant } : msg
    ));
    
    const message = messages.find(m => m.id === messageId);
    toast({
      description: `Message ${message?.isImportant ? 'unmarked' : 'marked'} as important`,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar variant="back" title="ChatView Test" onBackClick={() => window.history.back()} />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Chat View */}
        <div className="flex-1 border border-border rounded-lg overflow-hidden">
          <ChatView
            threadId="test-thread-1"
            threadType={threadType}
            threadTitle={threadTitle}
            messages={messages}
            onSendMessage={handleSendMessage}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onToggleImportant={handleToggleImportant}
            isTyping={isTyping}
            quickReplies={quickReplies}
          />
        </div>

        {/* Info Panel */}
        <div className="lg:w-80 p-4 bg-muted rounded-lg space-y-4">
          <div>
            <h3 className="font-semibold mb-2">ChatView Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Thread header with icon & menu</li>
              <li>Date separators</li>
              <li>User messages (right, primary)</li>
              <li>MMAgent messages (left, gray)</li>
              <li>Hover/click for timestamps</li>
              <li>Star important messages</li>
              <li>Typing indicator (200ms delay)</li>
              <li>Message status icons</li>
              <li>Quick reply buttons</li>
              <li>Emoji picker</li>
              <li>Character counter (500 max)</li>
              <li>Auto-save drafts</li>
              <li>Auto-scroll to bottom</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold mb-2">Test Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => setIsTyping(!isTyping)}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm hover:bg-muted"
              >
                Toggle Typing Indicator
              </button>
              <button
                onClick={() => setMessages([])}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm hover:bg-muted"
              >
                Clear Messages
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm hover:bg-muted"
              >
                Reset Test
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold mb-2">Message Stats</h4>
            <div className="text-sm space-y-1">
              <p>Total: {messages.length}</p>
              <p>Important: {messages.filter(m => m.isImportant).length}</p>
              <p>Unread: {messages.filter(m => m.status !== 'read').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatViewTest;
