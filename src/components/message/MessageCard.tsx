import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MessageCardProps {
  avatar: string;
  name: string;
  preview: string;
  time: string;
  unreadCount?: number;
  isFromUser?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MessageCard = ({
  avatar,
  name,
  preview,
  time,
  unreadCount,
  isFromUser = false,
  onClick,
  className,
}: MessageCardProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-background',
        'border-b border-border',
        'active:bg-muted/50 transition-colors cursor-pointer',
        'min-h-[72px]',
        className
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl">
          {avatar}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-foreground truncate">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {isFromUser && <span className="font-medium">You: </span>}
          {preview}
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs text-muted-foreground">{time}</span>
        {unreadCount && unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="h-5 min-w-[20px] px-1.5 rounded-full text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </div>
    </motion.div>
  );
};
