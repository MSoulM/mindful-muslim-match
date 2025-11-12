import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface PremiumBenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  className?: string;
}

export const PremiumBenefitCard = ({
  icon: Icon,
  title,
  description,
  badge,
  className,
}: PremiumBenefitCardProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative bg-white rounded-2xl p-4 shadow-sm',
        'border border-neutral-200',
        'min-h-[120px] flex flex-col',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {badge && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 text-xs bg-primary-gold/10 text-primary-gold border-primary-gold/20"
        >
          {badge}
        </Badge>
      )}
      
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-forest to-primary-forest/70 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <h3 className="text-base font-semibold text-neutral-900 mb-1">
        {title}
      </h3>
      
      <p className="text-sm text-neutral-600 leading-snug">
        {description}
      </p>
    </motion.div>
  );
};
