import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Clock, Lightbulb, ArrowRight, ChevronDown, Heart, Palette, HeartHandshake, Sparkles, Users, Unlock, Trophy, Award, Calendar, CheckCircle, MoreVertical, Info, Settings, EyeOff, TrendingUp, ChevronUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { addDays, nextSunday, format, differenceInHours, differenceInMinutes } from 'date-fns';

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
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isEligibleBannerDismissed, setIsEligibleBannerDismissed] = useState(false);
  const [isEligibleBannerCollapsed, setIsEligibleBannerCollapsed] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Load dismissed state and check for celebration trigger
  useEffect(() => {
    const dismissed = localStorage.getItem('chaichat_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    const eligibleDismissed = localStorage.getItem('chaichat_eligible_banner_dismissed');
    if (eligibleDismissed === 'true') {
      setIsEligibleBannerDismissed(true);
    }

    const collapsed = sessionStorage.getItem('chaichat_banner_collapsed');
    if (collapsed === 'true') {
      setIsEligibleBannerCollapsed(true);
    }

    // Check if we should show celebration
    const celebrationShown = localStorage.getItem('chaichat_celebration_shown');
    const isEligible = currentCompletion >= 70;
    
    if (isEligible && celebrationShown !== 'true') {
      setShowCelebration(true);
      // Trigger confetti
      triggerConfetti();
    }
  }, [currentCompletion]);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const nextMatch = getNextChaiChatDate();
      const now = new Date();
      const hours = differenceInHours(nextMatch, now);
      const minutes = differenceInMinutes(nextMatch, now) % 60;

      if (hours < 1 && minutes < 30) {
        setCountdown('Starting soon!');
      } else if (hours < 24) {
        setCountdown(`In ${hours} hour${hours !== 1 ? 's' : ''}`);
      } else {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        setCountdown(`In ${days} day${days !== 1 ? 's' : ''}, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10B981', '#D4A574', '#F59E0B']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10B981', '#D4A574', '#F59E0B']
      });
    }, 250);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    localStorage.setItem('chaichat_celebration_shown', 'true');
    localStorage.setItem('chaichat_unlocked_at', new Date().toISOString());
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('chaichat_banner_dismissed', 'true');
  };

  // Calculate next Sunday at 2 AM
  const getNextChaiChatDate = () => {
    const now = new Date();
    const nextSun = nextSunday(now);
    nextSun.setHours(2, 0, 0, 0);
    return nextSun;
  };

  const nextMatchDate = getNextChaiChatDate();
  const daysUntil = Math.ceil((nextMatchDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Check if user just unlocked (within 24 hours)
  const unlockedAt = localStorage.getItem('chaichat_unlocked_at');
  const isRecentlyUnlocked = unlockedAt && 
    (Date.now() - new Date(unlockedAt).getTime()) < 24 * 60 * 60 * 1000;

  // Determine which banner to show
  const celebrationShown = localStorage.getItem('chaichat_celebration_shown') === 'true';
  const isEligible = currentCompletion >= 70;

  // Don't show anything if dismissed
  if (isDismissed && !isEligible) {
    return null;
  }

  // Show eligible banner instead of celebration after first view
  if (isEligible && celebrationShown && !isEligibleBannerDismissed) {
    // Render eligible banner (≥70% state)
    return (
      <>
        {showCelebration && (
          <AnimatePresence>
            {/* Keep celebration modal here for transition */}
          </AnimatePresence>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-4 relative"
        >
          <div className={cn(
            "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 shadow-md",
            isRecentlyUnlocked && "animate-pulse"
          )}>
            {/* Collapsible Header */}
            {isEligibleBannerCollapsed ? (
              <div className="flex items-center justify-between h-12">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    ChaiChat Active • Next: Sunday
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsEligibleBannerCollapsed(false);
                    sessionStorage.setItem('chaichat_banner_collapsed', 'false');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                {/* Expanded Content */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
                  {/* Left Section */}
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <Badge className="bg-white text-green-700 border-green-400 px-3 py-1 text-sm font-bold">
                      {isRecentlyUnlocked && <span className="mr-1">🎉</span>}
                      ChaiChat Active
                    </Badge>
                  </div>

                  {/* Center Section */}
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900">
                      Next matches: {format(nextMatchDate, 'EEEE')} 2:00 AM
                    </p>
                    <p className="text-sm text-gray-600">
                      {countdown}
                    </p>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-700">
                        {currentCompletion}% Complete
                      </p>
                      <p className="text-xs text-gray-500">Keep improving!</p>
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      <AnimatePresence>
                        {showActionsMenu && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-8 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
                          >
                            <button
                              onClick={() => {
                                navigate('/chaichat');
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <Info className="w-4 h-4" />
                              View ChaiChat Features
                            </button>
                            <button
                              onClick={() => {
                                navigate('/preferences');
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <Settings className="w-4 h-4" />
                              Set Match Preferences
                            </button>
                            <button
                              onClick={() => {
                                setIsEligibleBannerDismissed(true);
                                localStorage.setItem('chaichat_eligible_banner_dismissed', 'true');
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <EyeOff className="w-4 h-4" />
                              Hide This Banner
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Collapse Button */}
                    <button
                      onClick={() => {
                        setIsEligibleBannerCollapsed(true);
                        sessionStorage.setItem('chaichat_banner_collapsed', 'true');
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Mini Progress to 90% */}
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-600">
                      On your way to 90% (Best Match Quality)
                    </p>
                    <Star className="w-4 h-4 text-[#D4A574]" />
                  </div>
                  
                  <div className="relative w-full h-2 bg-white rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentCompletion / 90) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full"
                    />
                  </div>

                  {/* Enhancement Prompt */}
                  {currentCompletion < 90 && (
                    <button
                      onClick={onCompleteProfile}
                      className="mt-2 flex items-center gap-1 text-xs text-gray-600 hover:text-green-700"
                    >
                      <TrendingUp className="w-3 h-3" />
                      Improve to 90% for best matches
                      <span className="ml-1">→</span>
                    </button>
                  )}
                  {currentCompletion >= 90 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#D4A574]">
                      <Award className="w-3 h-3" />
                      Diamond Profile! Top-tier matching ✨
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </>
    );
  }

  // Don't show below-70% banner if user is eligible
  if (isEligible || isDismissed) {
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
    <>
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleCloseCelebration}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseCelebration}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close celebration"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.3, type: 'spring', bounce: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
                  <Unlock className="w-24 h-24 text-green-600" />
                </div>
              </motion.div>

              {/* Celebration Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-3">
                  🎉 Congratulations!
                </h1>
                
                <h2 className="text-2xl font-semibold text-green-700 text-center mb-6">
                  ChaiChat Unlocked!
                </h2>

                {/* Achievement Badge */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold">
                    <Award className="w-5 h-5" />
                    <span>Profile Completion Master</span>
                  </div>
                </div>
              </motion.div>

              {/* What is ChaiChat Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6"
              >
                <h3 className="text-lg font-bold text-green-900 mb-3">
                  What is ChaiChat?
                </h3>
                
                <div className="space-y-2">
                  <p className="text-base text-gray-700 leading-relaxed flex items-start gap-2">
                    <span>🤖</span>
                    <span>Your AI companion talks to potential matches' AI companions</span>
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed flex items-start gap-2">
                    <span>💬</span>
                    <span>They discuss compatibility before you ever message</span>
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed flex items-start gap-2">
                    <span>📊</span>
                    <span>You receive 3 highly compatible matches every Sunday</span>
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed flex items-start gap-2">
                    <span>✨</span>
                    <span>First ChaiChat conversation happens this Sunday at 2 AM</span>
                  </p>
                </div>
              </motion.div>

              {/* Next Match Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6"
              >
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-1">
                      Your first ChaiChat matches:
                    </p>
                    <p className="text-base text-gray-700">
                      {format(nextMatchDate, 'EEEE, MMMM d, yyyy')} at 2:00 AM
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Pro Tip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      💡 Pro Tip: Optimize your profile to 90% for highest quality matches!
                    </p>
                    <button
                      onClick={() => {
                        handleCloseCelebration();
                        onCompleteProfile?.();
                      }}
                      className="text-sm text-green-700 hover:underline mt-1 font-medium"
                    >
                      Keep Improving →
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  onClick={() => {
                    handleCloseCelebration();
                    navigate('/chaichat');
                  }}
                  className="flex-1 py-3 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-base font-semibold"
                >
                  View ChaiChat Features
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button
                  onClick={() => {
                    handleCloseCelebration();
                    navigate('/discover');
                  }}
                  variant="outline"
                  className="flex-1 py-3 px-6 border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-lg text-base font-semibold"
                >
                  Explore Matches
                </Button>
              </motion.div>

              <div className="text-center mt-4">
                <button
                  onClick={handleCloseCelebration}
                  className="text-gray-600 hover:underline text-base"
                >
                  Continue Building Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Below-70% Banner */}
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
    </>
  );
};
