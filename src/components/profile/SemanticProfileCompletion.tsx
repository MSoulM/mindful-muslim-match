import { motion } from 'framer-motion';
import { Medal, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SemanticProfileCompletionProps {
  completion?: number;
  onCompleteProfile?: () => void;
}

export const SemanticProfileCompletion = ({
  completion = 67, // Mock data for now
  onCompleteProfile
}: SemanticProfileCompletionProps) => {
  
  // Calculate level badge based on completion
  const getLevel = () => {
    if (completion >= 90) return { name: 'Diamond', color: 'from-cyan-400 to-blue-500', icon: Sparkles };
    if (completion >= 70) return { name: 'Gold', color: 'from-yellow-400 to-amber-500', icon: Medal };
    if (completion >= 41) return { name: 'Silver', color: 'from-gray-300 to-gray-400', icon: Medal };
    return { name: 'Bronze', color: 'from-orange-400 to-amber-600', icon: Medal };
  };

  // Get color based on completion percentage
  const getProgressColor = () => {
    if (completion >= 70) return '#10B981'; // Green
    if (completion >= 31) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  // Calculate ChaiChat eligibility
  const isChaiChatEligible = completion >= 70;
  const percentageAway = isChaiChatEligible ? 0 : 70 - completion;

  const level = getLevel();
  const LevelIcon = level.icon;
  const progressColor = getProgressColor();

  // Circle dimensions
  const radius = 55; // For 120px diameter (55 * 2 + stroke)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  return (
    <div className="w-full bg-background rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
      {/* Header with Level Badge */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Profile Completion
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete your profile to unlock ChaiChat
          </p>
        </div>
        
        {/* Level Badge */}
        <Badge 
          className={cn(
            "px-3 py-1.5 text-xs font-semibold text-white border-0",
            `bg-gradient-to-r ${level.color}`
          )}
        >
          <LevelIcon className="w-3.5 h-3.5 mr-1.5" />
          {level.name}
        </Badge>
      </div>

      {/* Circular Progress Indicator */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]">
          {/* Background Circle */}
          <svg 
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 120 120"
          >
            {/* Background track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
              opacity="0.2"
            />
            
            {/* Animated progress circle */}
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              stroke={progressColor}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: 0.2
              }}
            />
          </svg>

          {/* Percentage Text in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-foreground">
                {completion}%
              </div>
            </motion.div>
          </div>
        </div>

        {/* Status Text Below Circle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 text-center"
        >
          {isChaiChatEligible ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                ChaiChat Eligible - Matches unlocked!
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You're <span className="font-semibold text-foreground">{percentageAway}%</span> away from ChaiChat eligibility
            </p>
          )}
        </motion.div>

        {/* CTA Button - Only show if not 100% complete */}
        {completion < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="w-full sm:w-auto mt-6"
          >
            <Button
              onClick={onCompleteProfile}
              className="w-full sm:w-auto min-h-[44px] px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Complete Your Profile
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
