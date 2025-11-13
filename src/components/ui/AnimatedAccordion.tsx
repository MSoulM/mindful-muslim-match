import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { accordionAnimation, respectMotionPreference, optimizeForAnimation } from '@/utils/animations';
import { haptics } from '@/utils/haptics';

interface AnimatedAccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: ReactNode;
}

export const AnimatedAccordion = ({
  title,
  children,
  defaultOpen = false,
  className,
  icon,
}: AnimatedAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleAccordion = () => {
    haptics.tap();
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn('border-b border-border', className)}>
      <button
        onClick={toggleAccordion}
        className="w-full flex items-center justify-between py-4 text-left hover:opacity-80 transition-opacity touch-target"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-foreground">{icon}</span>}
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={optimizeForAnimation(['transform'])}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            variants={respectMotionPreference(accordionAnimation)}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            style={{
              ...optimizeForAnimation(['height', 'opacity']),
              overflow: 'hidden'
            }}
          >
            <div className="pb-4 text-muted-foreground">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
