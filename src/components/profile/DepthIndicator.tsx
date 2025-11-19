import React from 'react';
import { Waves, Target, Heart, Sparkles } from 'lucide-react';

interface DepthIndicatorProps {
  text: string;
  depthLevel: 1 | 2 | 3 | 4;
  multiplier: 1 | 2 | 3 | 5;
  showLabel?: boolean;
}

export const DepthIndicator: React.FC<DepthIndicatorProps> = ({ 
  depthLevel, 
  multiplier,
  showLabel = true 
}) => {
  const getDepthInfo = (level: number) => {
    switch(level) {
      case 1:
        return {
          label: 'Surface',
          colorClass: 'bg-muted',
          textColor: 'text-muted-foreground',
          icon: Waves,
          description: 'Basic fact shared'
        };
      case 2:
        return {
          label: 'Context',
          colorClass: 'bg-blue-500',
          textColor: 'text-blue-700',
          icon: Target,
          description: 'Added meaning and reason'
        };
      case 3:
        return {
          label: 'Emotional',
          colorClass: 'bg-purple-500',
          textColor: 'text-purple-700',
          icon: Heart,
          description: 'Shared feelings and connection'
        };
      case 4:
        return {
          label: 'Transformational',
          colorClass: 'bg-gradient-to-r from-amber-400 to-orange-500',
          textColor: 'text-amber-700',
          icon: Sparkles,
          description: 'Deep insight and growth story'
        };
      default:
        return {
          label: 'Surface',
          colorClass: 'bg-muted',
          textColor: 'text-muted-foreground',
          icon: Waves,
          description: 'Basic fact shared'
        };
    }
  };
  
  const depth = getDepthInfo(depthLevel);
  const Icon = depth.icon;
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border transition-all duration-500">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-full ${depth.colorClass}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          {showLabel && (
            <span className="text-sm font-semibold text-foreground">
              {depth.label} Level
            </span>
          )}
          <span className="text-xs text-muted-foreground">{depth.description}</span>
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">DNA Impact</div>
          <div className="text-lg font-bold text-primary">
            {multiplier}x
          </div>
        </div>
        
        {/* Visual multiplier bars */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i}
              className={`w-1.5 h-8 rounded-sm transition-all duration-500 ${
                i <= multiplier ? depth.colorClass : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
