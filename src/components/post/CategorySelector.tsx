/**
 * CategorySelector Component
 * Select DNA categories for posts (1-2 required)
 */

import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
  minSelect?: number;
  maxSelect?: number;
  required?: boolean;
  className?: string;
}

export const CategorySelector = ({
  categories,
  selected,
  onChange,
  minSelect = 1,
  maxSelect = 2,
  required = true,
  className,
}: CategorySelectorProps) => {
  const handleToggle = (categoryId: string) => {
    if (selected.includes(categoryId)) {
      // Deselect
      if (required && selected.length <= minSelect) return;
      onChange(selected.filter((id) => id !== categoryId));
    } else {
      // Select
      if (selected.length >= maxSelect) return;
      onChange([...selected, categoryId]);
    }
  };

  const isSelectable = (categoryId: string) => {
    if (selected.includes(categoryId)) return true;
    return selected.length < maxSelect;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium">
          Select Categories {required && <span className="text-red-600">*</span>}
        </label>
        <span className="text-xs text-muted-foreground">
          {selected.length} / {maxSelect} selected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const isSelected = selected.includes(category.id);
          const canSelect = isSelectable(category.id);

          return (
            <Card
              key={category.id}
              className={cn(
                'relative cursor-pointer transition-all',
                isSelected && 'border-primary bg-primary/5',
                !canSelect && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => canSelect && handleToggle(category.id)}
            >
              <div className="p-4 text-center">
                <div
                  className="text-3xl mb-2"
                  style={{ filter: `hue-rotate(${category.color})` }}
                >
                  {category.icon}
                </div>
                <p className="text-sm font-medium">{category.name}</p>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {selected.length < minSelect && (
        <p className="text-xs text-orange-600 mt-2">
          Please select at least {minSelect} {minSelect === 1 ? 'category' : 'categories'}
        </p>
      )}
    </div>
  );
};
