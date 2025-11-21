import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  haptic?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  haptic = true,
  children,
  onClick,
  type = 'button',
  className,
}: ButtonProps) => {
  const handleClick = () => {
    if (loading || disabled || !onClick) return;
    
    // Haptic feedback
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
    
    onClick();
  };

  // Size styles
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm gap-2',
    md: 'h-11 px-5 text-md gap-2',
    lg: 'h-[52px] px-6 text-base gap-2.5',
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-[18px] h-[18px]',
    md: 'w-5 h-5',
    lg: 'w-[22px] h-[22px]',
  };

  // Variant styles
  const variantClasses = {
    primary: cn(
      'bg-primary-forest text-white',
      'hover:bg-primary-forest/90',
      'active:bg-primary-forest/80',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    secondary: cn(
      'bg-transparent border-2 border-primary-forest text-primary-forest',
      'hover:bg-primary-forest/5',
      'active:bg-primary-forest/10',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    ghost: cn(
      'bg-transparent text-neutral-700',
      'hover:bg-neutral-100',
      'active:bg-neutral-200',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    danger: cn(
      'bg-semantic-error text-white',
      'hover:bg-semantic-error/90',
      'active:bg-semantic-error/80',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.15 }}
      className={cn(
        'relative flex items-center justify-center',
        'rounded-xl font-semibold',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-forest focus-visible:ring-offset-2',
        'touch-feedback',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
    >
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner
            size={size === 'sm' ? 'sm' : 'md'}
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'}
          />
        </div>
      )}

      {/* Content */}
      <span
        className={cn(
          'flex items-center justify-center gap-2',
          loading && 'opacity-0'
        )}
      >
        {icon && iconPosition === 'left' && (
          <span className={cn('flex-shrink-0', iconSizes[size])}>
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className={cn('flex-shrink-0', iconSizes[size])}>
            {icon}
          </span>
        )}
      </span>
    </motion.button>
  );
};
