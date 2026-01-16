import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MoreVertical, Star, Smile, Check, CheckCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { THREAD_TYPES, ThreadType } from './ThreadList';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useVirtualList } from '@/hooks/useVirtualList';
import { cn } from '@/lib/utils';
import { useAgentName } from '@/hooks/useAgentName';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isImportant?: boolean;
}

interface ChatViewProps {
  threadId: string;
  threadType: ThreadType;
  threadTitle: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onToggleImportant?: (messageId: string) => void;
  messageGestures?: {
    onTouchStart: (messageId: string) => void;
    onTouchEnd: (messageId: string) => void;
    onTouchCancel: () => void;
  };
  isTyping?: boolean;
  quickReplies?: string[];
}

export const ChatView = ({
  threadId,
  threadType,
  threadTitle,
  messages,
  onSendMessage,
  onArchive,
  onDelete,
  onToggleImportant,
  messageGestures,
  isTyping = false,
  quickReplies = []
}: ChatViewProps) => {
  const [messageText, setMessageText] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { keyboardHeight, isKeyboardOpen } = useKeyboardHeight();
  const customAgentName = useAgentName();

  const threadConfig = THREAD_TYPES[threadType];
  const maxChars = 500;
  const charCount = messageText.length;

  // Virtual scrolling for long conversations (>50 messages)
  const enableVirtualScroll = messages.length > 50;
  const containerHeight = window.innerHeight - 200; // Approximate chat container height
  
  const {
    containerRef: virtualContainerRef,
    virtualItems,
    totalHeight,
    scrollToIndex
  } = useVirtualList(messages, {
    itemHeight: 80, // Average message height
    containerHeight,
    overscan: 5,
    enabled: enableVirtualScroll
  });

  // Merge refs for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (enableVirtualScroll && virtualContainerRef.current) {
      scrollContainerRef.current = virtualContainerRef.current;
    } else {
      scrollContainerRef.current = messagesContainerRef.current;
    }
  }, [enableVirtualScroll]);

  // Auto-scroll to bottom when new messages arrive or keyboard opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping, keyboardHeight]);

  // Dismiss keyboard on scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isKeyboardOpen && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isKeyboardOpen]);

  // Show typing indicator with delay
  useEffect(() => {
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setShowTyping(true);
      }, 200);
    } else {
      setShowTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping]);

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftKey = `draft_${threadId}`;
    
    if (messageText) {
      localStorage.setItem(draftKey, messageText);
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [messageText, threadId]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = `draft_${threadId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setMessageText(savedDraft);
    }
  }, [threadId]);

  const handleSend = () => {
    if (messageText.trim() && messageText.length <= maxChars) {
      onSendMessage(messageText.trim());
      setMessageText('');
      localStorage.removeItem(`draft_${threadId}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply && reply.trim()) {
      onSendMessage(reply.trim());
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const dateKey = format(message.timestamp, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(message);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  const formatDateSeparator = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-background flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{threadConfig.icon}</span>
          <div>
            <h3 className="font-semibold text-foreground">{threadTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {customAgentName || 'MMAgent'} is here to help
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onArchive && (
              <DropdownMenuItem onClick={onArchive}>
                Archive Chat
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete Chat
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={messagesContainerRef}>
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
            <div key={dateKey}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {formatDateSeparator(new Date(dateKey))}
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-4">
                {dateMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onToggleImportant={onToggleImportant}
                    gestures={messageGestures}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {showTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickReply(reply)}
              className="whitespace-nowrap"
            >
              {reply}
            </Button>
          ))}
        </div>
      )}

      {/* Input Area - with keyboard offset */}
      <div 
        className="p-4 border-t border-border bg-background transition-all duration-200"
        style={{ 
          paddingBottom: isKeyboardOpen ? `${keyboardHeight + 16}px` : '16px' 
        }}
      >
        {/* Quick replies above input when keyboard is open */}
        {isKeyboardOpen && quickReplies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-2 overflow-x-auto pb-2 mb-2"
          >
            {quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                className="whitespace-nowrap"
              >
                {reply}
              </Button>
            ))}
          </motion.div>
        )}

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <EmojiPicker onSelect={handleEmojiSelect} />
            </PopoverContent>
          </Popover>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              maxLength={maxChars}
              className="min-h-[40px] max-h-[120px] resize-none pr-16"
              rows={1}
            />
            <div
              className={cn(
                "absolute bottom-2 right-2 text-xs",
                charCount > maxChars * 0.9 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {charCount}/{maxChars}
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || charCount > maxChars}
            className="h-10 w-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: ChatMessage;
  onToggleImportant?: (messageId: string) => void;
  gestures?: {
    onTouchStart: (messageId: string) => void;
    onTouchEnd: (messageId: string) => void;
    onTouchCancel: () => void;
  };
}

const MessageBubble = ({ message, onToggleImportant, gestures }: MessageBubbleProps) => {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isUser = message.role === 'user';

  const getStatusIcon = () => {
    if (!isUser) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src="/myagent-icon.jpg" />
          <AvatarFallback>MM</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[75%] flex flex-col",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-2 rounded-2xl relative group cursor-pointer",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          )}
          onClick={() => setShowTimestamp(!showTimestamp)}
          onMouseEnter={() => setShowTimestamp(true)}
          onMouseLeave={() => setShowTimestamp(false)}
          onTouchStart={() => gestures?.onTouchStart(message.id)}
          onTouchEnd={() => gestures?.onTouchEnd(message.id)}
          onTouchCancel={() => gestures?.onTouchCancel()}
        >
          {message.isImportant && (
            <Star
              className="absolute -top-2 -left-2 w-4 h-4 text-yellow-500 fill-yellow-500 z-10"
            />
          )}
          
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {onToggleImportant && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -left-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => {
                e.stopPropagation();
                onToggleImportant(message.id);
              }}
            >
              <Star className={cn(
                "w-3 h-3",
                message.isImportant && "fill-current"
              )} />
            </Button>
          )}
        </div>

        <div className={cn(
          "flex items-center gap-1 mt-1 px-1",
          showTimestamp ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-xs text-muted-foreground">
            {format(message.timestamp, 'h:mm a')}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </motion.div>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  const customAgentName = useAgentName();
  
  return (
    <div className="flex gap-2">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src="/myagent-icon.jpg" />
        <AvatarFallback>MM</AvatarFallback>
      </Avatar>
      
      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
        <div className="flex gap-1">
          <span className="text-sm text-muted-foreground">
            {customAgentName || 'MMAgent'} is typing
          </span>
          <motion.div
            className="w-2 h-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
};

// Simple Emoji Picker Component
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onSelect }: EmojiPickerProps) => {
  const emojis = [
    '😊', '😂', '❤️', '👍', '🙏', '😍', '🤲', '✨',
    '🌟', '💝', '🌸', '🌹', '💐', '🎉', '🤝', '💪',
    '📝', '✅', '❌', '⭐', '💯', '🔥', '👏', '🙌'
  ];

  return (
    <div className="grid grid-cols-8 gap-2 p-2">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onSelect(emoji)}
          className="text-2xl hover:bg-muted rounded p-1 transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
