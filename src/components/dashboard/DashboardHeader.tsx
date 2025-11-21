import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useAgentName } from '@/hooks/useAgentName';
import { UserPersonalityType } from '@/components/onboarding/PersonalityAssessment';

interface DashboardHeaderProps {
  personalityType: UserPersonalityType;
  onChatClick?: () => void;
  hasNewInsights?: boolean;
  className?: string;
}

const personalityConfig = {
  wise_aunty: {
    name: "The Wise Aunty",
    defaultGreeting: "Your Wise Aunty is ready to assist",
  },
  modern_scholar: {
    name: "The Modern Scholar",
    defaultGreeting: "Your Modern Scholar is ready to assist",
  },
  spiritual_guide: {
    name: "The Spiritual Guide",
    defaultGreeting: "Your Spiritual Guide is ready to assist",
  },
  cultural_bridge: {
    name: "The Cultural Bridge",
    defaultGreeting: "Your Cultural Bridge is ready to assist",
  }
};

export const DashboardHeader = ({ 
  personalityType, 
  onChatClick,
  hasNewInsights = false,
  className 
}: DashboardHeaderProps) => {
  const agentName = useAgentName();
  const config = personalityConfig[personalityType];
  
  const getGreeting = () => {
    if (agentName) {
      return `${agentName} is here to help you today`;
    } else {
      return config.defaultGreeting;
    }
  };

  const displayName = agentName || config.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-foreground">
                Chat with {displayName}
              </h2>
              {hasNewInsights && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-medium">New</span>
                </motion.div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {hasNewInsights 
                ? `${displayName} has new insights for you`
                : getGreeting()
              }
            </p>

            {onChatClick && (
              <Button 
                onClick={onChatClick}
                className="gap-2"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
                Start Conversation
              </Button>
            )}
          </div>

          {/* Agent Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0"
          >
            <span className="text-3xl">🤖</span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
