import { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { VoiceMessage } from './VoiceMessage';
import { MediaViewer } from './MediaViewer';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/utils/dateUtils';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'emoji';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: Message;
  reactions?: { emoji: string; userId: string }[];
  edited?: boolean;
  voiceNote?: {
    duration: number;
    waveform: number[];
    url?: string;
  };
  images?: {
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
  }[];
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  matchPhoto?: string;
}

export const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
  matchPhoto
}: MessageBubbleProps) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };
  
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 rounded-full border-2 border-current animate-spin" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={cn(
      "flex gap-2 items-end",
      isOwn ? "justify-end" : "justify-start"
    )}>
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={matchPhoto} />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      )}
      
      {!isOwn && !showAvatar && (
        <div className="w-8 shrink-0" />
      )}
      
      <div className={cn(
        "max-w-[75%] flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        {message.replyTo && (
          <div className={cn(
            "px-3 py-2 mb-1 rounded-lg border-l-2 text-xs bg-muted/50",
            isOwn ? "border-primary" : "border-foreground"
          )}>
            <p className="font-medium text-muted-foreground">
              {message.replyTo.senderId === message.senderId ? 'You' : 'Match'}
            </p>
            <p className="text-muted-foreground truncate">
              {message.replyTo.content}
            </p>
          </div>
        )}
        
        <div className={cn(
          "rounded-2xl overflow-hidden",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}>
          {message.type === 'voice' && message.voiceNote ? (
            <VoiceMessage
              duration={message.voiceNote.duration}
              waveform={message.voiceNote.waveform}
              audioUrl={message.voiceNote.url}
              isOwn={isOwn}
            />
          ) : message.type === 'image' && message.images && message.images.length > 0 ? (
            <div>
              {/* Image grid */}
              <div className={cn(
                "grid gap-1",
                message.images.length === 1 ? "grid-cols-1" : 
                message.images.length === 2 ? "grid-cols-2" :
                message.images.length === 3 ? "grid-cols-3" :
                "grid-cols-2"
              )}>
                {message.images.map((img, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "relative aspect-square cursor-pointer hover:opacity-90 transition-opacity",
                      message.images!.length === 1 && "max-w-[280px] aspect-auto"
                    )}
                    onClick={() => handleImageClick(idx)}
                  >
                    <img
                      src={img.url}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              
              {/* Caption if present */}
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words px-4 py-2">
                  {message.content}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words px-4 py-2">
              {message.content}
            </p>
          )}
        </div>
        
        <div className={cn(
          "flex items-center gap-1 mt-1 px-1",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className="text-muted-foreground opacity-70">
              {getStatusIcon()}
            </span>
          )}
          {message.edited && (
            <span className="text-xs text-muted-foreground italic">
              edited
            </span>
          )}
        </div>
        
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <div
                key={index}
                className="px-2 py-1 bg-background border border-border rounded-full text-xs"
              >
                {reaction.emoji}
              </div>
            ))}
          </div>
        )}
      </div>

      {message.images && message.images.length > 0 && (
        <MediaViewer
          images={message.images}
          initialIndex={viewerIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};
