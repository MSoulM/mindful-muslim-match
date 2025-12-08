import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PersonalityRevealProps } from '@/types/onboarding';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, TrendingUp } from 'lucide-react';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { updateAgentName } from '@/hooks/useAgentName';
import { usePersonalityAssessment } from '@/hooks/usePersonalityAssessment';
import { PERSONALITY_REVEAL_CONFIG } from '@/config/onboardingConstants';

export const PersonalityReveal = ({ personality, onContinue, onTryDifferent }: PersonalityRevealProps) => {
  const { assessment, isLoadingAssessment } = usePersonalityAssessment();
  const config = PERSONALITY_REVEAL_CONFIG[personality];
  const IconComponent = config.icon as React.ComponentType<{ className?: string; color?: string }>;
  const [customName, setCustomName] = useState('');

  const getPlaceholderByPersonality = (personalityType: PersonalityRevealProps['personality']) => {
    switch(personalityType) {
      case 'wise_aunty': 
        return 'e.g., Auntie Sarah, Khalto Maryam';
      case 'modern_scholar': 
        return 'e.g., Dr. Hassan, Professor Amina';
      case 'spiritual_guide': 
        return 'e.g., Sister Fatima, Brother Omar';
      case 'cultural_bridge': 
        return 'e.g., Mentor Zara, Guide Rashid';
      default: 
        return 'Enter a name';
    }
  };

  // Format completion date
  const formatCompletionDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return null;
    }
  };

  // Calculate score percentage
  const getScorePercentage = (score: number, maxScore: number = 15) => {
    return Math.round((score / maxScore) * 100);
  };

  // Get max score for percentage calculation
  const getMaxScore = () => {
    if (!assessment?.scores) return 15;
    return Math.max(...Object.values(assessment.scores));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4"
        >
          <IconComponent className="w-10 h-10" color={config.color} />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-foreground">
          Your MMAgent: {config.name}
        </h2>
        <p className="text-muted-foreground">{config.tagline}</p>
        
        {/* Show completion date if available from real data */}
        {assessment?.completedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Assessment completed on {formatCompletionDate(assessment.completedAt)}
          </p>
        )}
      </div>

      {/* Assessment Scores Card - Show real data from database */}
      {assessment && assessment.scores && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Your Assessment Results</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(assessment.scores).map(([type, score]) => {
                const isSelected = type === personality;
                const maxScore = getMaxScore();
                const percentage = maxScore > 0 ? getScorePercentage(score, maxScore) : 0;
                return (
                  <div
                    key={type}
                    className={`p-2 rounded transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-background/50 border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-medium text-xs ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {score} pts
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isSelected ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* What to Expect Card */}
      <Card className="p-6 space-y-4 border-2" style={{ borderColor: config.color }}>
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5" color={config.color} />
          What to Expect
        </h3>
        <ul className="space-y-2">
          {config.expectations.map((expectation, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span className="text-primary mt-0.5">•</span>
              <span>{expectation}</span>
            </motion.li>
          ))}
        </ul>
      </Card>

      {/* Sample Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-2"
      >
        <p className="text-sm text-muted-foreground text-center">
          {assessment?.completedAt 
            ? "Here's your personalized greeting from your MMAgent:"
            : "Here's a sample greeting from your MMAgent:"}
        </p>
        <AgentMessage
          message={config.sampleGreeting}
          variant="welcome"
        />
      </motion.div>

      {/* Make it Personal Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 p-6 bg-muted rounded-lg space-y-4"
      >
        <h3 className="text-lg font-semibold text-foreground">Make it Personal</h3>
        <p className="text-muted-foreground">
          Give your {config.name} a name to make your journey more personal
        </p>
        
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder={getPlaceholderByPersonality(personality)}
            maxLength={30}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="h-12"
          />
          
          <div className="text-sm text-muted-foreground">
            {customName ? `You'll see "${customName}" throughout the app` : "You can always add a name later"}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-3"
      >
        <Button
          onClick={() => {
            if (customName.trim()) {
              updateAgentName(customName.trim());
            }
            onContinue();
          }}
          className="w-full h-12 text-base"
          size="lg"
        >
          Continue with {customName || config.name}
        </Button>
        <Button
          onClick={onTryDifferent}
          variant="outline"
          className="w-full"
        >
          See All Personalities
        </Button>
      </motion.div>
    </motion.div>
  );
};
