import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { haptics } from '@/utils/haptics';
import { getTouchClasses, expandTouchTarget } from '@/utils/touchOptimization';
import { useLongPress } from '@/hooks/useLongPress';

interface TouchOptimizedIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  loading?: boolean;
  badge?: number | string;
  badgeColor?: 'error' | 'success' | 'warning' | 'primary';
  hapticFeedback?: boolean;
  onLongPress?: () => void;
  longPressDelay?: number;
  'aria-label': string;
}

export const TouchOptimizedIconButton = forwardRef<HTMLButtonElement, TouchOptimizedIconButtonProps>(
  (
    {
      icon,
      size = 'md',
      variant = 'default',
      loading = false,
      badge,
      badgeColor = 'error',
      hapticFeedback = true,
      onLongPress,
      onClick,
      longPressDelay = 500,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const longPressHandlers = useLongPress({
      onLongPress: onLongPress || (() => {}),
      onClick: () => {
        if (!loading && !disabled && onClick) {
          (onClick as any)(event);
        }
      },
      delay: longPressDelay,
      haptic: hapticFeedback,
    });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;

      if (hapticFeedback) {
        haptics.tap();
      }

      if (!onLongPress && onClick) {
        onClick(e);
      }
    };

    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-11 h-11',
      lg: 'w-[52px] h-[52px]',
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const variantClasses = {
      default: 'bg-transparent text-foreground hover:bg-accent',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'text-destructive hover:bg-destructive/10',
    };

    const badgeColorClasses = {
      error: 'bg-semantic-error',
      success: 'bg-semantic-success',
      warning: 'bg-semantic-warning',
      primary: 'bg-primary',
    };

    const handlers = onLongPress ? longPressHandlers : {};

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.9 }}
        type={props.type || 'button'}
        aria-label={props['aria-label']}
        className={cn(
          getTouchClasses('icon'),
          'relative rounded-full',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[size],
          variantClasses[variant],
          longPressHandlers.isLongPressing && 'ring-2 ring-primary',
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...handlers}
      >
        {/* Loading State */}
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className={iconSizeClasses[size]}>{icon}</span>
        )}

        {/* Badge */}
        {badge !== undefined && !loading && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute -top-1 -right-1 rounded-full',
              'min-w-[20px] h-5 px-1.5',
              'flex items-center justify-center',
              'text-xs font-bold text-white',
              'shadow-sm',
              badgeColorClasses[badgeColor]
            )}
          >
            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
          </motion.div>
        )}

        {/* Long Press Indicator */}
        {longPressHandlers.isLongPressing && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.3 }}
            className="absolute inset-0 rounded-full bg-primary"
          />
        )}
      </motion.button>
    );
  }
);

TouchOptimizedIconButton.displayName = 'TouchOptimizedIconButton';
