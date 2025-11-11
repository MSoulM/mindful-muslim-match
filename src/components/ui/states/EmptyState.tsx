import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  variant?: 'matches' | 'messages' | 'insights' | 'chaichat' | 'custom';
  customIcon?: string;
  customTitle?: string;
  customDescription?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const emptyStateConfig = {
  matches: {
    icon: '🔍',
    title: 'No Matches Yet',
    description: 'New compatible matches appear every Sunday. Your MMAgent is working to find the perfect connections for you.',
    action: { label: 'Improve My DNA', route: '/dna' }
  },
  messages: {
    icon: '💬',
    title: 'No Messages Yet',
    description: 'When you connect with matches, your conversations will appear here. Take your time - quality matters more than quantity.',
  },
  insights: {
    icon: '✨',
    title: 'All Caught Up!',
    description: "You've reviewed all pending insights. Share more about yourself to help your MMAgent understand you better.",
    action: { label: 'Create a Post', route: '/dna' }
  },
  chaichat: {
    icon: '☕',
    title: 'No ChaiChats Yet',
    description: 'Your MMAgent will start conversations with compatible matches to explore deeper compatibility before you connect.',
  }
};

export const EmptyState = ({
  variant = 'custom',
  customIcon,
  customTitle,
  customDescription,
  action
}: EmptyStateProps) => {
  const navigate = useNavigate();
  
  const config = variant === 'custom' 
    ? { icon: customIcon, title: customTitle, description: customDescription }
    : emptyStateConfig[variant];

  const defaultAction = variant !== 'custom' && 'action' in emptyStateConfig[variant]
    ? (emptyStateConfig[variant] as any).action 
    : null;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
      {/* Icon with subtle bounce animation */}
      <div className="text-6xl mb-4 animate-bounce-subtle">
        {config.icon}
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-bold text-foreground mb-2">
        {config.title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed mb-6">
        {config.description}
      </p>
      
      {/* Action Button */}
      {(action || defaultAction) && (
        <Button
          variant="primary"
          onClick={action?.onClick || (() => defaultAction && navigate(defaultAction.route))}
          className="min-w-[160px]"
        >
          {action?.label || (defaultAction && defaultAction.label)}
        </Button>
      )}
    </div>
  );
};
