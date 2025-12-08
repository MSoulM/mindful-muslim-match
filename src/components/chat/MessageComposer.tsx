import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { ImagePicker } from './ImagePicker';
import { AudioRecordingResult } from '@/hooks/useAudioRecorder';

interface MessageComposerProps {
  onSend: (message: string) => void;
  onSendVoiceNote?: (result: AudioRecordingResult) => void;
  onSendImages?: (files: File[]) => void;
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
  onSendVoiceNote,
  onSendImages,
  onTyping,
  onStopTyping,
  replyTo,
  onCancelReply
}: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
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
    setShowRecorder(true);
  };

  const handleVoiceNoteSend = (result: AudioRecordingResult) => {
    if (onSendVoiceNote) {
      onSendVoiceNote(result);
    }
    setShowRecorder(false);
  };

  const handleVoiceNoteCancel = () => {
    setShowRecorder(false);
  };

  const handleImagePicker = () => {
    setShowImagePicker(true);
  };

  const handleImageSelect = (files: File[]) => {
    if (onSendImages) {
      onSendImages(files);
    }
    setShowImagePicker(false);
  };

  const handleImageCancel = () => {
    setShowImagePicker(false);
  };
  
  return (
    <>
      {showRecorder && (
        <VoiceNoteRecorder
          onSend={handleVoiceNoteSend}
          onCancel={handleVoiceNoteCancel}
          maxDuration={60}
        />
      )}

      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onCancel={handleImageCancel}
          maxFiles={5}
          maxSizeMB={10}
        />
      )}
      
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
        <div className="flex items-end gap-2">
            <Button
              size="icon"
              onClick={handleImagePicker}
              className="shrink-0 h-10 w-10 mb-1"
            >
              <Image />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="min-h-12 max-h-[120px] h-auto resize-none pr-10 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none"
                rows={1}
              />
              <Smile className="absolute right-6 bottom-3 h-6 w-6" />
            </div>
            
            {message.trim() ? (
              <Button
                onClick={handleSend}
                size="icon"
                className="shrink-0 h-10 w-10 mb-1"
              >
                <Send className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleVoiceRecord}
                className="shrink-0 h-10 w-10 mb-1"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        
        {/* Character Counter */}
        {message.length > 900 && (
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {message.length}/1000
          </p>
        )}
      </div>
    </div>
    </>
  );
};
