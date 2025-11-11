import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'ghost';
  badge?: number | string;
  badgeColor?: 'red' | 'gold' | 'green';
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  ariaLabel: string;
  onClick?: () => void;
  className?: string;
}

export const IconButton = ({
  icon,
  size = 'md',
  variant = 'default',
  badge,
  badgeColor = 'red',
  loading = false,
  disabled = false,
  haptic = true,
  ariaLabel,
  onClick,
  className,
}: IconButtonProps) => {
  const handleClick = () => {
    if (loading || disabled || !onClick) return;
    
    // Haptic feedback
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
    
    onClick();
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-[52px] h-[52px]',
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Badge sizes
  const badgeSizes = {
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-[18px] h-[18px] text-[10px]',
    lg: 'w-5 h-5 text-[11px]',
  };

  // Variant styles
  const variantClasses = {
    default: cn(
      'bg-transparent text-neutral-700',
      'hover:bg-neutral-100',
      'active:bg-neutral-200'
    ),
    primary: cn(
      'bg-primary-forest text-white',
      'hover:bg-primary-forest/90',
      'active:bg-primary-forest/80'
    ),
    ghost: cn(
      'bg-transparent text-neutral-600',
      'hover:bg-neutral-50',
      'active:bg-neutral-100'
    ),
  };

  // Badge colors
  const badgeColorClasses = {
    red: 'bg-semantic-error',
    gold: 'bg-primary-gold',
    green: 'bg-semantic-success',
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.9 } : undefined}
      transition={{ duration: 0.15 }}
      className={cn(
        'relative flex items-center justify-center rounded-full',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-forest focus-visible:ring-offset-2',
        'touch-feedback',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={ariaLabel}
    >
      {/* Loading state */}
      {loading ? (
        <LoadingSpinner
          size={size === 'sm' ? 'sm' : 'md'}
          color={variant === 'primary' ? 'white' : 'primary'}
        />
      ) : (
        <span className={iconSizes[size]}>{icon}</span>
      )}

      {/* Badge */}
      {badge !== undefined && !loading && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className={cn(
            'absolute -top-1 -right-1 rounded-full',
            'flex items-center justify-center',
            'font-bold text-white leading-none',
            badgeSizes[size],
            badgeColorClasses[badgeColor]
          )}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </motion.div>
      )}
    </motion.button>
  );
};
