import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  matchPhoto?: string;
}

export const TypingIndicator = ({ matchPhoto }: TypingIndicatorProps) => {
  return (
    <div className="flex items-end gap-2">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={matchPhoto} />
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      
      <div className="px-4 py-3 bg-muted rounded-2xl rounded-bl-md">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
};
