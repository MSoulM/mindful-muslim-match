import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Medal, Sparkles, ChevronRight, ChevronDown, Heart, Palette, HeartHandshake, Users, Pencil, Type, CheckCircle2, Check, X } from 'lucide-react';
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Mock category data
  const categories = [
    {
      id: 'values',
      name: 'Values & Beliefs',
      icon: Heart,
      color: '#D4A574',
      percentage: 74,
    },
    {
      id: 'interests',
      name: 'Interests & Hobbies',
      icon: Palette,
      color: '#8B5CF6',
      percentage: 50,
    },
    {
      id: 'relationship',
      name: 'Relationship Goals',
      icon: HeartHandshake,
      color: '#EC4899',
      percentage: 85,
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle & Personality',
      icon: Sparkles,
      color: '#10B981',
      percentage: 60,
    },
    {
      id: 'family',
      name: 'Family & Cultural',
      icon: Users,
      color: '#F59E0B',
      percentage: 40,
    },
  ];
  
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

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {categories.map((category, index) => {
          const CategoryIcon = category.icon;
          const isExpanded = expandedCard === category.id;
          const isComplete = category.percentage >= 70;
          const isInProgress = category.percentage >= 40 && category.percentage < 70;
          
          // Status badge config
          const getStatusBadge = () => {
            if (isComplete) return { text: 'Complete ✓', bg: 'bg-emerald-100 text-emerald-700' };
            if (isInProgress) return { text: 'In Progress ⏳', bg: 'bg-yellow-100 text-yellow-700' };
            return { text: 'Not Started 📝', bg: 'bg-red-100 text-red-700' };
          };

          const statusBadge = getStatusBadge();

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                'bg-white dark:bg-card rounded-xl shadow-lg p-6 border-2 transition-colors',
                isComplete ? 'border-emerald-500' : 'border-border'
              )}
            >
              {/* Card Header - Clickable */}
              <button
                onClick={() => setExpandedCard(isExpanded ? null : category.id)}
                className="w-full flex items-center gap-4 text-left"
              >
                {/* Category Icon */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <CategoryIcon
                    className="w-6 h-6"
                    style={{ color: category.color }}
                  />
                </div>

                {/* Category Name & Percentage */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-foreground truncate">
                    {category.name}
                  </h3>
                </div>

                {/* Completion Percentage */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: category.color }}
                  >
                    {category.percentage}%
                  </span>
                  
                  {/* Expand/Collapse Chevron */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </div>
              </button>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${category.color}CC, ${category.color})`
                  }}
                />
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex items-center justify-between">
                <Badge className={cn('px-2.5 py-1 text-xs font-medium', statusBadge.bg)}>
                  {statusBadge.text}
                </Badge>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-border">
                      {/* Quick Stats Row */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5" />
                          <span>5 posts</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Type className="w-3.5 h-3.5" />
                          <span>280 words</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>3/4 topics</span>
                        </div>
                      </div>

                      {/* Factor 1: Content Item Count (40%) */}
                      <div 
                        className="bg-muted/50 rounded-lg p-4 mb-4"
                        style={{ borderLeft: `4px solid ${category.color}` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm text-foreground">Content Items</h4>
                          <Badge className="bg-muted-foreground text-white text-xs px-2 py-0.5 rounded-full">
                            40%
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">5</span>
                            <span className="text-sm text-muted-foreground">items shared</span>
                          </div>
                          
                          {/* Two-stage Progress Bar */}
                          <div className="relative">
                            {/* Background */}
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                              {/* Yellow fill (0-60%) */}
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '60%' }}
                                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                                className="absolute h-3 bg-yellow-500 rounded-full"
                              />
                              {/* Green fill (60-62.5%) */}
                              <motion.div
                                initial={{ width: '60%' }}
                                animate={{ width: '62.5%' }}
                                transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
                                className="absolute h-3 bg-emerald-500 rounded-full"
                              />
                            </div>
                            
                            {/* Markers */}
                            <div className="absolute top-0 left-[60%] transform -translate-x-1/2">
                              <div className="w-0.5 h-3 bg-foreground/40" />
                              <span className="text-[10px] text-muted-foreground absolute -top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                Min
                              </span>
                            </div>
                            <div className="absolute top-0 right-0">
                              <div className="w-0.5 h-3 bg-foreground/40" />
                              <span className="text-[10px] text-muted-foreground absolute -top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                Ideal
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <Check className="w-3.5 h-3.5" />
                              <span>Minimum: 3 items</span>
                            </div>
                            <div className="text-muted-foreground">
                              Ideal: 8 items
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-border/50">
                            <span className="text-sm font-semibold text-emerald-600">Factor Score: 62.5%</span>
                          </div>
                        </div>
                      </div>

                      {/* Factor 2: Content Depth (30%) */}
                      <div 
                        className="bg-muted/50 rounded-lg p-4 mb-4"
                        style={{ borderLeft: `4px solid ${category.color}` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm text-foreground">Content Depth</h4>
                          <Badge className="bg-muted-foreground text-white text-xs px-2 py-0.5 rounded-full">
                            30%
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">280</span>
                            <span className="text-sm text-muted-foreground">words written</span>
                          </div>
                          
                          {/* Two-stage Progress Bar */}
                          <div className="relative">
                            {/* Background */}
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                              {/* Yellow fill (0-60%) */}
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '60%' }}
                                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                                className="absolute h-3 bg-yellow-500 rounded-full"
                              />
                              {/* Green fill (60-70%) */}
                              <motion.div
                                initial={{ width: '60%' }}
                                animate={{ width: '70%' }}
                                transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
                                className="absolute h-3 bg-emerald-500 rounded-full"
                              />
                            </div>
                            
                            {/* Markers */}
                            <div className="absolute top-0 left-[60%] transform -translate-x-1/2">
                              <div className="w-0.5 h-3 bg-foreground/40" />
                              <span className="text-[10px] text-muted-foreground absolute -top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                Min
                              </span>
                            </div>
                            <div className="absolute top-0 right-0">
                              <div className="w-0.5 h-3 bg-foreground/40" />
                              <span className="text-[10px] text-muted-foreground absolute -top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                Ideal
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <Check className="w-3.5 h-3.5" />
                              <span>Minimum: 150 words</span>
                            </div>
                            <div className="text-muted-foreground">
                              Ideal: 400+ words
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-border/50">
                            <span className="text-sm font-semibold text-emerald-600">Factor Score: 70%</span>
                          </div>
                        </div>
                      </div>

                      {/* Factor 3: Topic Coverage (30%) */}
                      <div 
                        className="bg-muted/50 rounded-lg p-4 mb-4"
                        style={{ borderLeft: `4px solid ${category.color}` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm text-foreground">Topic Coverage</h4>
                          <Badge className="bg-muted-foreground text-white text-xs px-2 py-0.5 rounded-full">
                            30%
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">3/4</span>
                            <span className="text-sm text-muted-foreground">topics covered</span>
                          </div>
                          
                          {/* Segmented Progress Bar */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((segment) => (
                              <motion.div
                                key={segment}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ 
                                  duration: 0.5, 
                                  delay: 0.6 + (segment * 0.15), 
                                  ease: 'easeOut' 
                                }}
                                className={cn(
                                  'flex-1 h-3 rounded-full',
                                  segment <= 3 ? 'bg-emerald-500' : 'bg-muted'
                                )}
                                style={{ originX: 0 }}
                              />
                            ))}
                          </div>
                          
                          <div className="text-sm font-semibold text-emerald-600">
                            75% coverage
                          </div>
                          
                          {/* Topic List */}
                          <div className="space-y-1.5 pt-2">
                            <div className="flex items-center gap-2 text-sm text-emerald-600">
                              <Check className="w-4 h-4" />
                              <span>Religious Practice</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-emerald-600">
                              <Check className="w-4 h-4" />
                              <span>Spiritual Values</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-emerald-600">
                              <Check className="w-4 h-4" />
                              <span>Community Involvement</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <X className="w-4 h-4" />
                              <span>Islamic Knowledge</span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-border/50">
                            <span className="text-sm font-semibold text-emerald-600">Factor Score: 75%</span>
                          </div>
                        </div>
                      </div>

                      {/* Final Score Calculation */}
                      <div className="pt-4 border-t border-border">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-mono">
                            (Factor1 × 0.4) + (Factor2 × 0.3) + (Factor3 × 0.3)
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            25% + 21% + 22.5% = 68.5%
                          </p>
                          <div className="flex items-baseline gap-2 mt-3">
                            <span className="text-sm font-semibold text-muted-foreground">Category Score:</span>
                            <span 
                              className="text-2xl font-bold"
                              style={{ color: category.color }}
                            >
                              68.5%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
