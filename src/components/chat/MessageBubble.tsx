import { Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
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
          "px-4 py-2 rounded-2xl",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 mt-1 px-1",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
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
    </div>
  );
};
