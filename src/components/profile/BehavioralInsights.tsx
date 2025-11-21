import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, TrendingUp, Sparkles, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BehavioralInsightsProps {
  /**
   * Optional override data for demo/testing
   * In production, this would come from analytics API
   */
  insights?: {
    responseSpeed: 'immediate' | 'quick' | 'thoughtful' | 'reflective';
    messageStyle: 'brief' | 'medium' | 'detailed';
    activityHours: number[]; // Hours where user is most active (0-23)
    emojiUsage: 'minimal' | 'moderate' | 'expressive';
  };
}

const responseSpeedLabels = {
  immediate: { label: 'Quick Responder', color: 'text-blue-600', percentage: 90 },
  quick: { label: 'Active Communicator', color: 'text-green-600', percentage: 75 },
  thoughtful: { label: 'Thoughtful Responder', color: 'text-emerald-600', percentage: 65 },
  reflective: { label: 'Careful Thinker', color: 'text-purple-600', percentage: 50 },
};

const messageStyleLabels = {
  brief: { label: 'Concise Communicator', index: 0 },
  medium: { label: 'Balanced Communicator', index: 1 },
  detailed: { label: 'Expressive Writer', index: 2 },
};

const emojiUsageLabels = {
  minimal: { label: 'Text-Focused', emoji: '📝' },
  moderate: { label: 'Balanced Expression', emoji: '😊' },
  expressive: { label: 'Emotionally Expressive', emoji: '🎨' },
};

export function BehavioralInsights({ insights }: BehavioralInsightsProps) {
  const navigate = useNavigate();

  // Default demo data if no insights provided
  const defaultInsights = {
    responseSpeed: 'thoughtful' as const,
    messageStyle: 'medium' as const,
    activityHours: [19, 20, 21, 22, 23],
    emojiUsage: 'moderate' as const,
  };

  const data = insights || defaultInsights;
  const responseData = responseSpeedLabels[data.responseSpeed];
  const styleData = messageStyleLabels[data.messageStyle];
  const emojiData = emojiUsageLabels[data.emojiUsage];

  // Generate compatibility tip based on patterns
  const getCompatibilityTip = () => {
    if (data.messageStyle === 'detailed' && data.responseSpeed === 'thoughtful') {
      return '💡 You match best with people who appreciate thoughtful, detailed conversations in the evening hours.';
    }
    if (data.messageStyle === 'brief' && data.responseSpeed === 'immediate') {
      return '💡 You connect well with people who value quick, efficient communication throughout the day.';
    }
    return '💡 Your balanced communication style makes you compatible with a wide range of conversation partners.';
  };

  return (
    <div className="space-y-4">
      {/* Main Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                Your Communication Style
              </h3>
              <p className="text-xs text-muted-foreground">
                Based on your recent activity
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Private
            </Badge>
          </div>

          {/* Response Pattern */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Response Speed</span>
              </div>
              <span className={`text-sm font-medium ${responseData.color}`}>
                {responseData.label}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${responseData.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You take time to craft meaningful responses
            </p>
          </div>

          {/* Message Style */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Message Detail</span>
              </div>
              <span className="text-sm font-medium text-primary">
                {styleData.label}
              </span>
            </div>
            <div className="flex gap-2">
              {['Brief', 'Medium', 'Detailed'].map((style, i) => (
                <motion.div
                  key={style}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    i === styleData.index
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="text-xs">{style}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Emoji Usage */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">Expression Style</span>
              <span className="text-sm font-medium text-primary">
                {emojiData.emoji} {emojiData.label}
              </span>
            </div>
            <div className="flex gap-2">
              {['minimal', 'moderate', 'expressive'].map((level) => (
                <div
                  key={level}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    level === data.emojiUsage ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Activity Pattern */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Most Active Hours</span>
            </div>
            <div className="flex gap-px">
              {Array.from({ length: 24 }, (_, i) => {
                const isActive = data.activityHours.includes(i);
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: '3rem' }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex-1 rounded-sm transition-colors ${
                      isActive ? 'bg-primary' : 'bg-muted'
                    }`}
                    title={`${i}:00 - ${(i + 1) % 24}:00`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-xs text-muted-foreground">12AM</span>
              <span className="text-xs text-muted-foreground">12PM</span>
              <span className="text-xs text-muted-foreground">11PM</span>
            </div>
          </div>

          {/* Compatibility Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4"
          >
            <p className="text-sm text-foreground leading-relaxed">
              {getCompatibilityTip()}
            </p>
          </motion.div>
        </Card>
      </motion.div>

      {/* How This Helps Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                How this helps your matches
              </p>
              <p>
                We use these insights to find people whose communication style complements yours,
                without sharing your raw data. Only compatibility scores are visible to potential matches.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Privacy Control Button */}
      <Button
        variant="outline"
        className="w-full h-12"
        onClick={() => navigate('/settings/privacy')}
      >
        <Settings className="w-4 h-4 mr-2" />
        Manage Privacy Settings
      </Button>
    </div>
  );
}
