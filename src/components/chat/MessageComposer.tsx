import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  onSend: (message: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  replyTo?: { id: string; content: string; sender: string };
  onCancelReply?: () => void;
}

const SALAAM_SUGGESTIONS = [
  'As-salamu alaykum',
  'Wa alaykumu s-salam',
  'JazakAllahu khayran',
  'Alhamdulillah',
  'In sha Allah',
  'Masha Allah'
];

export const MessageComposer = ({
  onSend,
  onTyping,
  onStopTyping,
  replyTo,
  onCancelReply
}: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);
  
  useEffect(() => {
    // Check for Islamic phrase suggestions
    const lastWord = message.split(' ').pop()?.toLowerCase() || '';
    
    if (lastWord.length >= 2) {
      const matches = SALAAM_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(lastWord)
      );
      
      if (matches.length > 0) {
        setSuggestions(matches);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [message]);
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setMessage(value);
      
      // Typing indicator
      onTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
      }, 1000);
    }
  };
  
  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      onStopTyping();
      setShowSuggestions(false);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const insertSuggestion = (suggestion: string) => {
    const words = message.split(' ');
    words[words.length - 1] = suggestion;
    setMessage(words.join(' ') + ' ');
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };
  
  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };
  
  return (
    <div className="border-t border-border bg-card safe-bottom">
      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-muted/50 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Replying to {replyTo.sender}</p>
            <p className="text-sm text-foreground truncate">{replyTo.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="px-4 py-2 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => insertSuggestion(suggestion)}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="px-4 py-3">
        {isRecording ? (
          <div className="flex items-center gap-3 bg-destructive/10 rounded-full px-4 py-3">
            <div className="flex-1 flex items-center gap-3">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
              <span className="text-sm font-medium text-destructive">Recording...</span>
              <span className="text-sm text-muted-foreground">0:34</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceRecord}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-10 w-10"
              disabled
              title="Coming Soon"
            >
              <Image className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="min-h-[44px] max-h-[120px] resize-none pr-10 py-3"
                rows={1}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8"
                disabled
                title="Coming Soon"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            
            {message.trim() ? (
              <Button
                onClick={handleSend}
                size="icon"
                className="shrink-0 h-10 w-10 rounded-full"
              >
                <Send className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceRecord}
                className="shrink-0 h-10 w-10"
                disabled
                title="Coming Soon"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
        
        {/* Character Counter */}
        {message.length > 900 && (
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {message.length}/1000
          </p>
        )}
      </div>
    </div>
  );
};
