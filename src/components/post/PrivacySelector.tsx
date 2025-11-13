/**
 * PrivacySelector Component
 * Select post visibility with icon indicators
 */

import { Globe, Heart, Crown, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PrivacyLevel = 'everyone' | 'matches' | 'premium' | 'private';

interface PrivacyOption {
  value: PrivacyLevel;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPremium?: boolean;
}

interface PrivacySelectorProps {
  value: PrivacyLevel;
  onChange: (value: PrivacyLevel) => void;
  isPremium?: boolean;
  className?: string;
}

const privacyOptions: PrivacyOption[] = [
  {
    value: 'everyone',
    label: 'Everyone',
    description: 'Visible to all users',
    icon: Globe,
  },
  {
    value: 'matches',
    label: 'Matches Only',
    description: 'Only your matches can see',
    icon: Heart,
  },
  {
    value: 'premium',
    label: 'Premium Members',
    description: 'Premium users only',
    icon: Crown,
    requiresPremium: true,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can see',
    icon: Lock,
  },
];

export const PrivacySelector = ({
  value,
  onChange,
  isPremium = false,
  className,
}: PrivacySelectorProps) => {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-3 block">
        Who can see this post?
      </label>

      <div className="space-y-2">
        {privacyOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          const isLocked = option.requiresPremium && !isPremium;

          return (
            <Card
              key={option.value}
              className={cn(
                'cursor-pointer transition-all',
                isSelected && 'border-primary bg-primary/5',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !isLocked && onChange(option.value)}
            >
              <div className="p-3 flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-primary text-white' : 'bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{option.label}</p>
                    {option.requiresPremium && (
                      <Badge variant="secondary" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
