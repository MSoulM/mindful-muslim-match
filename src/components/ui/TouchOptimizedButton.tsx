import { forwardRef, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { haptics } from '@/utils/haptics';
import { getTouchClasses } from '@/utils/touchOptimization';
import { useLongPress } from '@/hooks/useLongPress';

interface TouchOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  hapticFeedback?: boolean;
  onLongPress?: () => void;
  longPressDelay?: number;
  showRipple?: boolean;
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      hapticFeedback = true,
      onLongPress,
      onClick,
      longPressDelay = 500,
      showRipple = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

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

      // Haptic feedback
      if (hapticFeedback) {
        haptics.tap();
      }

      // Ripple effect
      if (showRipple) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = { x, y, id: Date.now() };
        setRipples((prev) => [...prev, newRipple]);

        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);
      }

      if (!onLongPress && onClick) {
        onClick(e);
      }
    };

    const sizeClasses = {
      sm: 'h-10 px-4 text-sm',
      md: 'min-h-[44px] px-6 text-base',
      lg: 'min-h-[52px] px-8 text-lg',
    };

    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };

    const handlers = onLongPress ? longPressHandlers : {};

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        type={props.type || 'button'}
        className={cn(
          getTouchClasses('button'),
          'relative overflow-hidden',
          'rounded-lg font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-label={props['aria-label']}
        {...handlers}
      >
        {/* Ripple Effects */}
        {showRipple &&
          ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 animate-ping"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 10,
                height: 10,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Content */}
        <span className={cn('flex items-center justify-center gap-2', loading && 'invisible')}>
          {children}
        </span>
      </motion.button>
    );
  }
);

TouchOptimizedButton.displayName = 'TouchOptimizedButton';
