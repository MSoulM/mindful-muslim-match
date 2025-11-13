import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const PremiumCard = ({
  children,
  variant = 'default',
  className,
  hover = false,
  glow = false,
}: PremiumCardProps) => {
  const baseClasses = "rounded-xl transition-all duration-300";
  
  const variantClasses = {
    default: cn(
      "bg-card border border-border",
      "shadow-premium"
    ),
    glass: cn(
      "glass",
      "border border-border/50"
    ),
    gradient: cn(
      "gradient-subtle",
      "border border-primary/20"
    ),
  };

  const hoverClasses = hover ? "hover:shadow-lg hover:-translate-y-0.5" : "";
  const glowClasses = glow ? "shadow-glow" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        glowClasses,
        className
      )}
    >
      {children}
    </motion.div>
  );
};
