import { Heart, MessageCircle, Coffee, Trophy, Info, ChevronRight, Trash2, Circle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'match' | 'message' | 'chaichat' | 'dna' | 'system' | 'achievement';
  title: string;
  body: string;
  icon?: string;
  image?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: {
    badge?: string;
    progress?: number;
    action?: string;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
  onToggleRead: () => void;
}

export const NotificationItem = ({
  notification,
  onPress,
  onDelete,
  onToggleRead
}: NotificationItemProps) => {
  const getIconComponent = () => {
    const iconClasses = "h-5 w-5";
    
    switch (notification.type) {
      case 'match':
        return <Heart className={iconClasses} />;
      case 'message':
        return <MessageCircle className={iconClasses} />;
      case 'chaichat':
        return <Coffee className={iconClasses} />;
      case 'dna':
      case 'achievement':
        return <Trophy className={iconClasses} />;
      case 'system':
        return <Info className={iconClasses} />;
      default:
        return <Circle className={iconClasses} />;
    }
  };
  
  const getIconBg = () => {
    switch (notification.type) {
      case 'match':
        return 'bg-pink-100 text-pink-600';
      case 'message':
        return 'bg-blue-100 text-blue-600';
      case 'chaichat':
        return 'bg-amber-100 text-amber-600';
      case 'dna':
      case 'achievement':
        return 'bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold))] text-white';
      case 'system':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "border-b border-border transition-colors",
        !notification.read && "bg-primary/5"
      )}
    >
      <button
        onClick={onPress}
        className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left"
      >
        {/* Icon or Avatar */}
        {notification.image ? (
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={notification.image} />
            <AvatarFallback>{notification.title[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
            getIconBg()
          )}>
            {getIconComponent()}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm font-semibold text-foreground",
              !notification.read && "font-bold"
            )}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {notification.body}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            
            {notification.data?.badge && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {notification.data.badge}
              </span>
            )}
            
            {notification.data?.action && (
              <span className="text-xs text-primary font-medium">
                {notification.data.action}
              </span>
            )}
          </div>
          
          {notification.data?.progress !== undefined && (
            <div className="mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${notification.data.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </button>
      
      {/* Swipe Actions */}
      <div className="flex border-t border-border">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead();
          }}
          className="flex-1 py-2 text-xs text-center text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          {notification.read ? 'Mark Unread' : 'Mark Read'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-1 py-2 text-xs text-center text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3 inline mr-1" />
          Delete
        </button>
      </div>
    </motion.div>
  );
};
