import { ReactNode } from 'react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HelpCategoryCardProps {
  icon: ReactNode;
  label: string;
  articleCount: number;
  gradient: string;
  onClick: () => void;
}

export const HelpCategoryCard = ({
  icon,
  label,
  articleCount,
  gradient,
  onClick,
}: HelpCategoryCardProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <BaseCard
        padding="md"
        className={cn(
          'min-h-[100px] flex flex-col items-center justify-center text-center',
          gradient
        )}
      >
        <div className="w-8 h-8 mb-2 text-white">
          {icon}
        </div>
        <h3 className="font-semibold text-white mb-1">{label}</h3>
        <p className="text-xs text-white/80">{articleCount} articles</p>
      </BaseCard>
    </motion.div>
  );
};
