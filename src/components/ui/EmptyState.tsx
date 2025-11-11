import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'subtle';
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-6',
        variant === 'default' && 'min-h-[400px]',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'mb-4',
            variant === 'default' ? 'text-7xl' : 'text-5xl'
          )}
        >
          {icon}
        </motion.div>
      )}

      {/* Title */}
      <h3
        className={cn(
          'font-bold text-neutral-900 mb-2',
          variant === 'default' ? 'text-xl' : 'text-lg'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-neutral-600 max-w-md leading-relaxed',
            variant === 'default' ? 'text-md mb-6' : 'text-sm mb-4'
          )}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <Button
          variant="primary"
          size={variant === 'default' ? 'lg' : 'md'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};
