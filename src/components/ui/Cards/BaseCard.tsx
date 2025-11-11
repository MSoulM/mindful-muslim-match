import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BaseCardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export const BaseCard = ({
  padding = 'md',
  shadow = 'sm',
  borderRadius = 'md',
  interactive = false,
  onClick,
  children,
  className,
}: BaseCardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const radiusClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
  };

  const Component = interactive || onClick ? motion.div : 'div';

  return (
    <Component
      onClick={onClick}
      {...(interactive || onClick
        ? {
            whileTap: { scale: 0.98 },
            transition: { duration: 0.15 },
          }
        : {})}
      className={cn(
        'bg-white border border-neutral-200',
        'transition-all duration-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        radiusClasses[borderRadius],
        (interactive || onClick) && 'cursor-pointer hover:shadow-md touch-feedback',
        className
      )}
    >
      {children}
    </Component>
  );
};
