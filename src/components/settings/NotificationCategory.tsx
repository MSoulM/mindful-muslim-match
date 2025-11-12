import { ReactNode, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotificationOption {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}

interface NotificationCategoryProps {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  options?: NotificationOption[];
  onOptionToggle?: (optionId: string, enabled: boolean) => void;
}

export const NotificationCategory = ({
  icon,
  title,
  description,
  enabled,
  onToggle,
  options,
  onOptionToggle,
}: NotificationCategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasOptions = options && options.length > 0;

  return (
    <BaseCard padding="md" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className="flex-shrink-0"
        />
      </div>

      {hasOptions && enabled && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-full"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide options
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show options ({options.length})
              </>
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2 pl-[52px] pr-3"
              >
                {options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-start justify-between gap-3 py-2 border-t border-border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{option.label}</p>
                      {option.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={option.enabled}
                      onCheckedChange={(checked) => 
                        onOptionToggle?.(option.id, checked)
                      }
                      className="flex-shrink-0"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </BaseCard>
  );
};
