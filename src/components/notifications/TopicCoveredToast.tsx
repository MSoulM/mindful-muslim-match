import { CheckCircle2 } from 'lucide-react';

interface TopicCoveredToastProps {
  topicName: string;
  categoryName: string;
  categoryColor: string;
}

export function TopicCoveredToast({
  topicName,
  categoryName,
  categoryColor,
}: TopicCoveredToastProps) {
  return (
    <div className="flex items-start gap-3 p-2">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${categoryColor}15` }}
      >
        <CheckCircle2 size={20} style={{ color: categoryColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm flex items-center gap-1">
          Topic Covered! 
          <span className="text-green-600">✓</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          <span className="font-medium" style={{ color: categoryColor }}>
            {topicName}
          </span>
          {' '}in {categoryName}
        </p>
      </div>
    </div>
  );
}
