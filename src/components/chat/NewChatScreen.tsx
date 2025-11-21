import { motion } from 'framer-motion';
import { AgentMessage } from './AgentMessage';
import { Sparkles, TrendingUp, Heart, MessageCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgentName } from '@/hooks/useAgentName';

interface QuickReply {
  id: string;
  text: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

interface NewChatScreenProps {
  onQuickReply: (value: string) => void;
  className?: string;
}

export const NewChatScreen = ({ onQuickReply, className }: NewChatScreenProps) => {
  const customAgentName = useAgentName();
  
  const quickReplies: QuickReply[] = [
    {
      id: '1',
      text: 'My Matches',
      value: 'Tell me about my matches',
      icon: <Heart className="w-5 h-5" />,
      description: 'See your potential matches'
    },
    {
      id: '2',
      text: 'Improve Profile',
      value: 'How can I improve my profile?',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Get profile tips'
    },
    {
      id: '3',
      text: 'Get Advice',
      value: 'I need some advice',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Ask for guidance'
    },
    {
      id: '4',
      text: 'Compatibility',
      value: 'What makes a good match?',
      icon: <MessageCircle className="w-5 h-5" />,
      description: 'Learn about matching'
    },
    {
      id: '5',
      text: 'Ask Anything',
      value: '',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'Start typing your question'
    }
  ];

  return (
    <div className={cn('flex-1 flex flex-col', className)}>
      {/* Welcome Section */}
      <div className="px-4 pt-6 pb-4">
        <AgentMessage
          avatar="🤖"
          title={customAgentName || "MMAgent"}
          message="Assalamu Alaikum! I'm here to guide you on your journey to find your soulmate. How can I help you today?"
          variant="welcome"
        />
      </div>

      {/* Quick Replies Grid */}
      <div className="flex-1 px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Choose a topic to get started:
          </p>
          
          <div className="grid gap-3">
            {quickReplies.map((reply, index) => (
              <motion.button
                key={reply.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                onClick={() => onQuickReply(reply.value)}
                className={cn(
                  'group relative flex items-start gap-4 p-4 rounded-xl',
                  'bg-card border border-border hover:border-primary/40',
                  'transition-all duration-200',
                  'hover:shadow-md hover:scale-[1.02]',
                  'active:scale-[0.98]',
                  'text-left'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full',
                  'bg-primary/10 group-hover:bg-primary/20',
                  'flex items-center justify-center',
                  'text-primary transition-colors'
                )}>
                  {reply.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {reply.text}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {reply.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
