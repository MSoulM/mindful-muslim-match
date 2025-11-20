import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Clock, Lightbulb, ArrowRight, ChevronDown, Heart, Palette, HeartHandshake, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChaiChatEligibilityTrackerProps {
  currentCompletion?: number;
  onCompleteProfile?: () => void;
}

interface CategoryData {
  id: string;
  name: string;
  icon: typeof Heart;
  percentage: number;
  weight: number;
  color: string;
}

export const ChaiChatEligibilityTracker = ({
  currentCompletion = 65,
  onCompleteProfile
}: ChaiChatEligibilityTrackerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load dismissed state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('chaichat_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('chaichat_banner_dismissed', 'true');
  };

  // Don't show if dismissed or if already at 70%+
  if (isDismissed || currentCompletion >= 70) {
    return null;
  }

  const percentageAway = 70 - currentCompletion;
  const timeEstimate = Math.round((percentageAway * 3) / 5) * 5; // Round to nearest 5 minutes

  // Mock category data
  const categories: CategoryData[] = [
    {
      id: 'values',
      name: 'Values & Beliefs',
      icon: Heart,
      percentage: 68,
      weight: 25,
      color: '#D4A574'
    },
    {
      id: 'interests',
      name: 'Interests & Hobbies',
      icon: Palette,
      percentage: 50,
      weight: 15,
      color: '#8B5CF6'
    },
    {
      id: 'relationship',
      name: 'Relationship Goals',
      icon: HeartHandshake,
      percentage: 75,
      weight: 25,
      color: '#EC4899'
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle & Personality',
      icon: Sparkles,
      percentage: 60,
      weight: 20,
      color: '#10B981'
    },
    {
      id: 'family',
      name: 'Family & Cultural',
      icon: Users,
      percentage: 55,
      weight: 15,
      color: '#F59E0B'
    }
  ];

  // Calculate contribution to overall score
  const calculateContribution = (percentage: number, weight: number) => {
    return Math.round((percentage * weight) / 100);
  };

  // Find quickest path to 70%
  const findQuickestPath = () => {
    const belowThreshold = categories.filter(cat => cat.percentage < 70);
    if (belowThreshold.length === 0) return null;
    
    // Sort by weight (target highest weight first for maximum impact)
    const sortedByWeight = [...belowThreshold].sort((a, b) => b.weight - a.weight);
    const targetCategory = sortedByWeight[0];
    const boostNeeded = 70 - targetCategory.percentage;
    const newOverall = currentCompletion + (boostNeeded * targetCategory.weight / 100);
    
    return {
      category: targetCategory.name,
      currentPercentage: targetCategory.percentage,
      boostNeeded,
      newOverall: Math.round(newOverall * 10) / 10
    };
  };

  const quickestPath = findQuickestPath();

  // Get status color for category
  const getCategoryColor = (percentage: number) => {
    if (percentage >= 70) return 'text-emerald-600 border-emerald-200 bg-emerald-50';
    if (percentage >= 50) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 mb-6"
    >
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Lock className="w-10 h-10 text-orange-600" />
            <Badge className="bg-white text-orange-700 border-orange-300 px-3 py-1 text-sm font-semibold">
              ChaiChat
            </Badge>
          </div>
          
          <button
            onClick={handleDismiss}
            className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-2">
          Unlock Weekly Matches with ChaiChat
        </h2>
        
        <p className="text-lg font-medium text-orange-700 mb-4">
          You're at {currentCompletion}% - Just {percentageAway}% away!
        </p>

        {/* Progress Bar */}
        <div className="relative mb-2">
          <div className="w-full h-4 bg-white border border-orange-200 rounded-full shadow-inner overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentCompletion}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            />
          </div>
          
          {/* 70% Threshold Marker */}
          <div className="absolute top-0 left-[70%] transform -translate-x-1/2 -translate-y-1">
            <div className="w-0.5 h-6 bg-green-600 border-dashed" style={{ borderWidth: '0 1px 0 0', borderStyle: 'dashed' }} />
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="inline-block bg-white text-xs font-semibold text-green-700 px-2 py-1 rounded-full border border-green-200">
                70% Goal
              </span>
            </div>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
          <Clock className="w-4 h-4" />
          <span>~{timeEstimate} minutes to unlock</span>
        </div>

        {/* Expandable Breakdown */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-orange-700 hover:underline cursor-pointer mt-4 transition-colors"
        >
          What's Needed to Reach 70%?
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

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
              <div className="mt-4 pt-4 border-t border-orange-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Your Category Breakdown
                </h3>

                {/* Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {categories.map((category) => {
                    const CategoryIcon = category.icon;
                    const contribution = calculateContribution(category.percentage, category.weight);
                    
                    return (
                      <div
                        key={category.id}
                        className={cn(
                          'bg-white p-3 rounded-lg border',
                          getCategoryColor(category.percentage)
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="w-4 h-4" style={{ color: category.color }} />
                          <span className="font-medium text-sm text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-1">
                          Weight: {category.weight}% → Contributes {contribution}% to overall
                        </div>
                        
                        {/* Mini Progress Bar */}
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${category.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        
                        <div className="text-xs font-semibold mt-1" style={{ color: category.color }}>
                          {category.percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quickest Path Section */}
                {quickestPath && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-green-700 mb-2">
                          🎯 Quickest Path to 70%
                        </h4>
                        
                        <p className="text-sm text-gray-700 mb-3">
                          Boost <span className="font-semibold">{quickestPath.category}</span> by {quickestPath.boostNeeded}% 
                          → This will push you to {quickestPath.newOverall}%
                        </p>
                        
                        <div className="text-sm text-gray-600">
                          <div className="font-medium mb-1">How to do it:</div>
                          <ul className="space-y-1 ml-4">
                            <li className="flex items-start gap-2">
                              <span>•</span>
                              <span>Add 2 posts about {quickestPath.category.toLowerCase()}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span>•</span>
                              <span>Estimated time: {timeEstimate} minutes</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-6"
        >
          <Button
            onClick={onCompleteProfile}
            className="w-full py-4 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Complete My Profile Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
