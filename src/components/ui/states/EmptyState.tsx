import { Button } from '../button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Sparkles, Coffee, FileText, Target } from 'lucide-react';

interface EmptyStateProps {
  variant?: 'matches' | 'messages' | 'insights' | 'chaichat' | 'dna' | 'posts' | 'custom';
  customIcon?: React.ReactNode;
  customTitle?: string;
  customDescription?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const emptyStateConfig = {
  matches: {
    icon: <Heart className="w-16 h-16 text-primary" />,
    title: 'No Matches Yet',
    description: 'New compatible matches appear every Sunday. Your MMAgent is working to find the perfect connections for you.',
    action: { label: 'Complete Your DNA', route: '/dna' }
  },
  messages: {
    icon: <MessageCircle className="w-16 h-16 text-primary" />,
    title: 'No Messages Yet',
    description: 'When you connect with matches, your conversations will appear here. Take your time - quality matters more than quantity.',
  },
  insights: {
    icon: <Sparkles className="w-16 h-16 text-primary" />,
    title: 'All Caught Up!',
    description: "You've reviewed all pending insights. Share more about yourself to help your MMAgent understand you better.",
    action: { label: 'Share Something', route: '/create-post' }
  },
  chaichat: {
    icon: <Coffee className="w-16 h-16 text-primary" />,
    title: 'No ChaiChats Yet',
    description: 'Your MMAgent will start conversations with compatible matches to explore deeper compatibility before you connect.',
  },
  dna: {
    icon: <Target className="w-16 h-16 text-primary" />,
    title: 'Complete Your DNA Profile',
    description: 'Answer questions about your values, interests, and goals to help us find your perfect match. The more you share, the better we can help.',
    action: { label: 'Start Questionnaire', route: '/dna' }
  },
  posts: {
    icon: <FileText className="w-16 h-16 text-primary" />,
    title: 'No Posts Yet',
    description: 'Share your thoughts, experiences, and what matters to you. Your posts help your MMAgent understand you better and improve your matches.',
    action: { label: 'Create Your First Post', route: '/create-post' }
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
    <motion.div 
      className="flex flex-col items-center justify-center py-12 px-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon with pulse animation */}
      <motion.div 
        className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-primary/10"
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {config.icon}
      </motion.div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-foreground mb-3">
        {config.title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-8">
        {config.description}
      </p>
      
      {/* Action Button */}
      {(action || defaultAction) && (
        <Button
          onClick={action?.onClick || (() => defaultAction && navigate(defaultAction.route))}
          className="min-w-[180px]"
        >
          {action?.label || (defaultAction && defaultAction.label)}
        </Button>
      )}
    </motion.div>
  );
};
