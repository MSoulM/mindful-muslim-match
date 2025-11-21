import { Star, StarHalf, Circle, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MemoryImportance } from '@/types/memory.types';
import { cn } from '@/lib/utils';

interface ImportanceBadgeProps {
  level: MemoryImportance;
  editable?: boolean;
  onEdit?: (newLevel: MemoryImportance) => void;
  className?: string;
}

export function ImportanceBadge({ 
  level, 
  editable = false, 
  onEdit,
  className 
}: ImportanceBadgeProps) {
  const styles = {
    high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    low: 'bg-muted text-muted-foreground border-border'
  };
  
  const icons = {
    high: <Star className="w-3 h-3 fill-current" />,
    medium: <StarHalf className="w-3 h-3" />,
    low: <Circle className="w-3 h-3" />
  };

  const labels = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority'
  };

  const handleClick = () => {
    if (editable && onEdit) {
      // Cycle through importance levels
      const levels: MemoryImportance[] = ['low', 'medium', 'high'];
      const currentIndex = levels.indexOf(level);
      const nextIndex = (currentIndex + 1) % levels.length;
      onEdit(levels[nextIndex]);
    }
  };

  return (
    <motion.div
      whileHover={editable ? { scale: 1.05 } : undefined}
      whileTap={editable ? { scale: 0.95 } : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
        styles[level],
        editable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={handleClick}
    >
      {icons[level]}
      <span>{labels[level]}</span>
      {editable && (
        <Edit2 className="w-3 h-3 ml-0.5 opacity-60" />
      )}
    </motion.div>
  );
}

interface ImportanceSelectorProps {
  currentLevel: MemoryImportance;
  onChange: (level: MemoryImportance) => void;
  className?: string;
}

export function ImportanceSelector({ 
  currentLevel, 
  onChange,
  className 
}: ImportanceSelectorProps) {
  const levels: MemoryImportance[] = ['low', 'medium', 'high'];

  return (
    <div className={cn('flex gap-2', className)}>
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={cn(
            'flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all',
            currentLevel === level
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-accent'
          )}
        >
          {level === 'high' && <Star className="w-3 h-3 inline mr-1" />}
          {level === 'medium' && <StarHalf className="w-3 h-3 inline mr-1" />}
          {level === 'low' && <Circle className="w-3 h-3 inline mr-1" />}
          <span className="capitalize">{level}</span>
        </button>
      ))}
    </div>
  );
}
