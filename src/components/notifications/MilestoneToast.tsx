interface MilestoneToastProps {
  type: 'chaichat_unlocked' | 'category_complete' | 'diamond_profile' | 'topic_covered';
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function MilestoneToast({
  type,
  message,
  description,
  action,
}: MilestoneToastProps) {
  const icons = {
    chaichat_unlocked: '🎉',
    category_complete: '✅',
    diamond_profile: '💎',
    topic_covered: '🌟',
  };

  const colors = {
    chaichat_unlocked: 'from-purple-500 to-pink-500',
    category_complete: 'from-green-500 to-emerald-500',
    diamond_profile: 'from-yellow-500 to-amber-500',
    topic_covered: 'from-blue-500 to-cyan-500',
  };

  return (
    <div className="flex items-start gap-3 p-3">
      <div className={`text-3xl shrink-0 bg-gradient-to-r ${colors[type]} bg-clip-text`}>
        <span className="inline-block animate-bounce">
          {icons[type]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground text-sm mb-1">
          {message}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">
            {description}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1"
          >
            {action.label}
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
