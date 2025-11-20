import { Scale } from 'lucide-react';

interface BalanceImprovedToastProps {
  oldScore: number;
  newScore: number;
  rating: 'excellent' | 'good' | 'needs-balance';
}

export function BalanceImprovedToast({
  oldScore,
  newScore,
  rating,
}: BalanceImprovedToastProps) {
  const increase = newScore - oldScore;

  const ratingInfo = {
    excellent: {
      label: 'Excellent Balance',
      color: '#10B981',
      emoji: '🎯',
    },
    good: {
      label: 'Good Balance',
      color: '#F59E0B',
      emoji: '⚖️',
    },
    'needs-balance': {
      label: 'Improving',
      color: '#3B82F6',
      emoji: '📈',
    },
  };

  const info = ratingInfo[rating];

  return (
    <div className="flex items-start gap-3 p-2">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${info.color}15` }}
      >
        <Scale size={20} style={{ color: info.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm flex items-center gap-1">
          {info.emoji} Balance Score Improved!
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {oldScore} → {newScore} 
          <span className="font-medium ml-1" style={{ color: info.color }}>
            (+{increase}) - {info.label}
          </span>
        </p>
      </div>
    </div>
  );
}
