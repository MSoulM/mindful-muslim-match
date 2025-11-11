import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface AgentMessageProps {
  avatar?: string;
  title?: string;
  message: string;
  timestamp?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  variant?: 'default' | 'highlight' | 'welcome';
  className?: string;
}

export const AgentMessage = ({
  avatar = '🤖',
  title,
  message,
  timestamp,
  actions,
  variant = 'default',
  className,
}: AgentMessageProps) => {
  const isWelcome = variant === 'welcome';
  const avatarSize = 'w-8 h-8';
  const titleSize = isWelcome ? 'text-md font-bold' : 'text-sm font-semibold';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex gap-3', className)}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-primary-forest to-[#4A8B8C]',
          'border-2 border-white shadow-sm',
          avatarSize
        )}
      >
        {avatar.startsWith('http') ? (
          <img src={avatar} alt="Agent" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-2xl">{avatar}</span>
        )}
      </div>

      {/* Message Bubble */}
      <div className="flex-1 max-w-[85%]">
        <div
          className={cn(
            'rounded-xl rounded-tl border shadow-sm',
            'px-4 py-3',
            variant === 'highlight'
              ? 'bg-primary-gold/5 border-primary-gold/20'
              : 'bg-white border-neutral-100'
          )}
        >
          {/* Title */}
          {title && (
            <h3 className={cn('text-neutral-700 mb-1', titleSize)}>
              {title}
            </h3>
          )}

          {/* Message */}
          <p className="text-md text-neutral-900 leading-relaxed">
            {message}
          </p>

          {/* Timestamp */}
          {timestamp && (
            <p className="text-xs text-neutral-500 mt-2">
              {timestamp}
            </p>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
