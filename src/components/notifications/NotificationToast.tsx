import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface NotificationToastProps {
  id: string;
  title: string;
  body: string;
  icon?: React.ReactNode;
  image?: string;
  duration?: number;
  onPress?: () => void;
  onDismiss?: () => void;
}

export const NotificationToast = ({
  id,
  title,
  body,
  icon,
  image,
  duration = 4000,
  onPress,
  onDismiss
}: NotificationToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);
  
  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y < -50) {
          onDismiss?.();
        }
      }}
      className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-md px-4 pt-4 safe-top"
    >
      <button
        onClick={() => onPress?.()}
        className={cn(
          "w-full bg-card border border-border rounded-2xl shadow-lg",
          "backdrop-blur-xl overflow-hidden",
          "transform transition-transform active:scale-[0.98]"
        )}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Icon or Avatar */}
          {image ? (
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={image} />
              <AvatarFallback>{title[0]}</AvatarFallback>
            </Avatar>
          ) : icon ? (
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {icon}
            </div>
          ) : null}
          
          {/* Content */}
          <div className="flex-1 min-w-0 text-left">
            <h4 className="font-semibold text-sm text-foreground mb-0.5">
              {title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {body}
            </p>
          </div>
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.();
            }}
            className="shrink-0 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Bar */}
        {duration > 0 && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className="h-1 bg-primary origin-left"
          />
        )}
      </button>
    </motion.div>
  );
};

interface NotificationToastContainerProps {
  notifications: Array<NotificationToastProps & { id: string }>;
  onDismiss: (id: string) => void;
  onPress: (id: string) => void;
}

export const NotificationToastContainer = ({
  notifications,
  onDismiss,
  onPress
}: NotificationToastContainerProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ y: index * -120 }}
            animate={{ y: index * 90 }}
            className="pointer-events-auto"
          >
            <NotificationToast
              {...notification}
              onDismiss={() => onDismiss(notification.id)}
              onPress={() => onPress(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
