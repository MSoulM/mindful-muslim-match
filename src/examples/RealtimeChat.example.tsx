import { useState, useRef, useEffect } from 'react';
import { useChatSocket, ChatMessage } from '@/hooks/useChatSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Circle } from 'lucide-react';

// Message bubble component
const MessageBubble = ({ 
  message, 
  isOwn 
}: { 
  message: ChatMessage; 
  isOwn: boolean;
}) => {
  const statusColor = {
    sending: 'text-muted-foreground',
    sent: 'text-muted-foreground',
    delivered: 'text-blue-500',
    read: 'text-green-500'
  }[message.status];

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 px-2">
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isOwn && (
            <span className={`text-xs ${statusColor}`}>
              • {message.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Typing indicator component
const TypingIndicator = ({ users }: { users: string[] }) => {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <Circle className="w-2 h-2 animate-bounce" style={{ animationDelay: '0ms' }} />
        <Circle className="w-2 h-2 animate-bounce" style={{ animationDelay: '150ms' }} />
        <Circle className="w-2 h-2 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {users.length === 1 
          ? `${users[0]} is typing...` 
          : `${users.length} people are typing...`}
      </span>
    </div>
  );
};

// Connection status badge
const ConnectionStatus = ({ 
  isConnected, 
  connectionState 
}: { 
  isConnected: boolean; 
  connectionState: string;
}) => {
  const statusConfig = {
    connected: { color: 'bg-green-500', label: 'Connected' },
    connecting: { color: 'bg-yellow-500', label: 'Connecting' },
    reconnecting: { color: 'bg-orange-500', label: 'Reconnecting' },
    disconnected: { color: 'bg-red-500', label: 'Disconnected' }
  };

  const config = statusConfig[connectionState as keyof typeof statusConfig] || statusConfig.disconnected;

  return (
    <Badge variant="outline" className="gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      {config.label}
    </Badge>
  );
};

// Main chat example component
export const RealtimeChatExample = () => {
  const chatId = 'demo-chat-123';
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isConnected,
    connectionState,
    typingUsers,
    sendMessage,
    sendTyping,
    markAsRead,
    sendReaction
  } = useChatSocket(chatId, {
    onMessage: (message) => {
      console.log('New message received:', message);
      // Auto-scroll to bottom on new message
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    },
    onTyping: (userId, isTyping) => {
      console.log(`${userId} typing:`, isTyping);
    },
    onStatusUpdate: (messageId, status) => {
      console.log(`Message ${messageId} status:`, status);
    }
  });

  // Auto-scroll on messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    await sendMessage(inputValue, 'text');
    setInputValue('');
    
    // Clear typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simulate marking messages as read when they appear
  useEffect(() => {
    const unreadMessages = messages
      .filter(m => m.senderId !== 'me' && m.status !== 'read')
      .map(m => m.id);

    if (unreadMessages.length > 0) {
      setTimeout(() => {
        markAsRead(unreadMessages);
      }, 1000);
    }
  }, [messages, markAsRead]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Real-time Chat Demo</CardTitle>
            <ConnectionStatus isConnected={isConnected} connectionState={connectionState} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages area */}
            <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === 'me'}
                    />
                  ))
                )}
                <TypingIndicator users={typingUsers} />
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={!isConnected}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !inputValue.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>Total messages: {messages.length}</p>
              <p>Connection state: {connectionState}</p>
              {typingUsers.length > 0 && (
                <p>Typing users: {typingUsers.join(', ')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
            <li>Real-time message delivery via WebSocket</li>
            <li>Optimistic UI updates for instant feedback</li>
            <li>Typing indicators with auto-timeout</li>
            <li>Message status tracking (sending → sent → delivered → read)</li>
            <li>Auto-reconnection with exponential backoff</li>
            <li>Message queueing when offline</li>
            <li>Auto-scroll to latest message</li>
            <li>Connection state visualization</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeChatExample;
