import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Medal, Sparkles, ChevronRight, ChevronDown, Heart, Palette, HeartHandshake, Users, Pencil, Type, CheckCircle2, Check, X, Lightbulb, Plus, Eye, Info, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  TOPIC_REQUIREMENTS,
  getTopicsForCategory,
  categoryHasRequiredTopics,
  type TopicRequirement,
  type CategoryType
} from '@/config/topicRequirements';

interface SemanticProfileCompletionProps {
  completion?: number;
  onCompleteProfile?: () => void;
}

export const SemanticProfileCompletion = ({
  completion = 67, // Mock data for now
  onCompleteProfile
}: SemanticProfileCompletionProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Mock topic coverage data
  const mockTopicCoverage: Record<string, {
    covered: string[];
    missing: string[];
    lastMentioned: Record<string, string>;
    exampleQuotes: Record<string, string>;
  }> = {
    values: {
      covered: ['vb_religious_practice', 'vb_spiritual_values', 'vb_community_involvement'],
      missing: ['vb_islamic_knowledge'],
      lastMentioned: {
        vb_religious_practice: '2 days ago',
        vb_spiritual_values: '1 week ago',
        vb_community_involvement: '3 days ago'
      },
      exampleQuotes: {
        vb_religious_practice: 'I try to pray all five daily prayers. Prayer keeps me grounded...',
        vb_spiritual_values: 'I strive to maintain good character in all interactions...',
        vb_community_involvement: 'I volunteer at the local food bank every weekend...'
      }
    },
    relationship: {
      covered: ['rg_marriage_timeline', 'rg_children_family'],
      missing: ['rg_lifestyle_vision'],
      lastMentioned: {
        rg_marriage_timeline: '5 days ago',
        rg_children_family: '1 week ago'
      },
      exampleQuotes: {
        rg_marriage_timeline: 'I\'m ready for marriage within the next 6-12 months...',
        rg_children_family: 'I definitely want children, ideally 2-3. Family is important...'
      }
    },
    family: {
      covered: ['fc_family_involvement'],
      missing: ['fc_cultural_traditions'],
      lastMentioned: {
        fc_family_involvement: '4 days ago'
      },
      exampleQuotes: {
        fc_family_involvement: 'My family is very important. I need their blessing...'
      }
    },
    interests: {
      covered: [],
      missing: [],
      lastMentioned: {},
      exampleQuotes: {}
    },
    lifestyle: {
      covered: [],
      missing: [],
      lastMentioned: {},
      exampleQuotes: {}
    }
  };

  // Helper to map category id to CategoryType
  const getCategoryType = (categoryId: string): CategoryType => {
    const mapping: Record<string, CategoryType> = {
      values: 'values_beliefs',
      interests: 'interests_hobbies',
      relationship: 'relationship_goals',
      lifestyle: 'lifestyle_personality',
      family: 'family_cultural'
    };
    return mapping[categoryId] || 'values_beliefs';
  };

  // Toggle expanded topic examples
  const toggleTopicExpanded = (topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

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
              id={`category-${category.id}`}
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

                          {/* Smart Suggestion */}
                          <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900">
                              + Add 3 more posts to reach ideal completion
                            </p>
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

                          {/* Smart Suggestion */}
                          <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900">
                              + Write 120 more words across your posts for ideal depth
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Factor 3: Topic Coverage (30%) */}
                      {(() => {
                        const categoryType = getCategoryType(category.id);
                        const hasRequiredTopics = categoryHasRequiredTopics(categoryType);
                        const topics = getTopicsForCategory(categoryType);
                        const coverage = mockTopicCoverage[category.id] || { covered: [], missing: [], lastMentioned: {}, exampleQuotes: {} };
                        const coveredCount = coverage.covered.length;
                        const totalTopics = topics.length;
                        const coveragePercentage = totalTopics > 0 ? Math.round((coveredCount / totalTopics) * 100) : 100;

                        if (!hasRequiredTopics) {
                          // Free-form category message
                          return (
                            <div 
                              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-sm text-foreground">Topic Coverage</h4>
                                <Badge className="bg-muted-foreground text-white text-xs px-2 py-0.5 rounded-full">
                                  30%
                                </Badge>
                              </div>
                              <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                  <h5 className="text-base font-bold text-blue-900">Free-Form Category</h5>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    This is a free-form category! Share any content about your {category.name.toLowerCase()} - there are no specific topics required.
                                  </p>
                                  <p className="text-xs text-gray-600 mt-2">
                                    The more you share, the better we can understand you.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Categories with required topics
                        return (
                          <div 
                            className="bg-gray-50 rounded-lg p-4 mb-4"
                            style={{ borderLeft: `4px solid ${category.color}` }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-sm text-foreground">Topic Coverage</h4>
                              <Badge className="bg-muted-foreground text-white text-xs px-2 py-0.5 rounded-full">
                                30%
                              </Badge>
                            </div>
                            <div className="space-y-4">
                              {/* Coverage Summary */}
                              <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-2xl font-bold text-gray-900">{coveredCount} out of {totalTopics} topics covered</span>
                              </div>
                              
                              {/* Coverage Percentage */}
                              <div className={cn(
                                "text-sm font-semibold mb-4",
                                coveragePercentage >= 75 ? "text-emerald-600" : 
                                coveragePercentage >= 50 ? "text-yellow-600" : 
                                "text-red-600"
                              )}>
                                {coveragePercentage}% topic coverage
                              </div>

                              {/* Segmented Progress Bar */}
                              <div className="flex gap-1 mb-4">
                                {topics.map((topic, segmentIndex) => {
                                  const isCovered = coverage.covered.includes(topic.id);
                                  return (
                                    <motion.div
                                      key={topic.id}
                                      initial={{ scaleX: 0 }}
                                      animate={{ scaleX: 1 }}
                                      transition={{ 
                                        duration: 0.5, 
                                        delay: 0.6 + (segmentIndex * 0.15), 
                                        ease: 'easeOut' 
                                      }}
                                      className={cn(
                                        'flex-1 h-3 rounded-full flex items-center justify-center',
                                        isCovered ? 'bg-emerald-500' : 'bg-gray-200'
                                      )}
                                      style={{ originX: 0 }}
                                    >
                                      {isCovered && <CheckCircle className="w-3 h-3 text-white" />}
                                    </motion.div>
                                  );
                                })}
                              </div>

                              {/* Topic List */}
                              <div className="space-y-2">
                                {/* Covered Topics */}
                                {topics.filter(t => coverage.covered.includes(t.id)).map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="bg-emerald-50 border border-emerald-200 rounded-md p-3"
                                  >
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                          <span className="text-base font-semibold text-emerald-900">{topic.name}</span>
                                          <Badge className="bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs rounded-full">
                                            Covered ✓
                                          </Badge>
                                        </div>
                                        
                                        {coverage.lastMentioned[topic.id] && (
                                          <p className="text-sm text-gray-600 mb-2">
                                            Last mentioned: {coverage.lastMentioned[topic.id]}
                                          </p>
                                        )}

                                        {coverage.exampleQuotes[topic.id] && (
                                          <p className="text-sm text-gray-700 italic mb-2">
                                            "{coverage.exampleQuotes[topic.id]}"
                                          </p>
                                        )}

                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs px-3 py-1.5 h-auto"
                                          onClick={() => toast({
                                            title: "Coming Soon",
                                            description: "Content viewer coming soon!",
                                          })}
                                        >
                                          View Content
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Missing Topics */}
                                {topics.filter(t => coverage.missing.includes(t.id)).map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="bg-orange-50 border border-orange-200 border-dashed rounded-md p-3"
                                  >
                                    <div className="flex items-start gap-2">
                                      <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                          <span className="text-base font-semibold text-orange-900">{topic.name}</span>
                                          <Badge className="bg-orange-100 text-orange-700 px-2 py-0.5 text-xs rounded-full">
                                            Not covered yet
                                          </Badge>
                                        </div>

                                        {/* Suggested Prompts */}
                                        <div className="mb-3">
                                          <p className="text-sm font-medium text-gray-700 mb-1">Suggested prompts:</p>
                                          <ul className="space-y-1">
                                            {topic.prompts.slice(0, 2).map((prompt, idx) => (
                                              <li
                                                key={idx}
                                                className="text-sm text-gray-600 hover:underline cursor-pointer flex items-start gap-1"
                                                onClick={() => toast({
                                                  title: "Content Creation",
                                                  description: "Opening content modal with this prompt...",
                                                })}
                                              >
                                                <span>•</span>
                                                <span>{prompt}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        {/* See Examples Toggle */}
                                        <button
                                          className="text-xs text-orange-700 underline mb-2 flex items-center gap-1 hover:text-orange-800"
                                          onClick={() => toggleTopicExpanded(topic.id)}
                                        >
                                          {expandedTopics.has(topic.id) ? (
                                            <>
                                              Hide Examples
                                              <ChevronDown className="w-3 h-3 rotate-180 transition-transform" />
                                            </>
                                          ) : (
                                            <>
                                              See Examples
                                              <ChevronDown className="w-3 h-3 transition-transform" />
                                            </>
                                          )}
                                        </button>

                                        {/* Expandable Examples */}
                                        <AnimatePresence>
                                          {expandedTopics.has(topic.id) && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="space-y-2 mb-3">
                                                {topic.examples.slice(0, 2).map((example, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="bg-white border border-orange-200 rounded-sm p-2 text-sm text-gray-600 italic"
                                                  >
                                                    {example}
                                                  </div>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>

                                        <Button
                                          size="sm"
                                          className="bg-orange-500 text-white hover:bg-orange-600 text-xs px-3 py-1.5 h-auto font-semibold"
                                          onClick={() => toast({
                                            title: "Add Content",
                                            description: `Opening content modal for: ${topic.name}`,
                                          })}
                                        >
                                          <Plus className="w-4 h-4 mr-1" />
                                          Add Content
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="pt-2 border-t border-border/50">
                                <span className="text-sm font-semibold text-emerald-600">Factor Score: {coveragePercentage}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Primary Action Button */}
                      <div className="mt-6 mb-4">
                        <Button
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "Content upload modal coming soon!",
                          })}
                          className="w-full min-h-[44px] py-3 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold transition-all active:scale-98"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add Content to This Category
                        </Button>
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

                      {/* Secondary Action Buttons */}
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "Content viewer coming soon!",
                          })}
                          className="flex-1 min-h-[44px] py-2 px-4 border border-border text-foreground hover:bg-muted transition-all"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View My Content
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "Educational modal coming soon!",
                          })}
                          className="flex-1 min-h-[44px] py-2 px-4 border border-border text-foreground hover:bg-muted transition-all"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Learn More
                        </Button>
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
