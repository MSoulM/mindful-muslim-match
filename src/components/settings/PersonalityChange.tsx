import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserPersonalityType } from '@/types/onboarding';
import { USER_PERSONALITIES } from '@/config/onboardingConstants';
import { PersonalityChangeQuestionnaire } from './PersonalityChangeQuestionnaire';
import { PersonalityPreview } from './PersonalityPreview';
import { Lock, Clock, TrendingUp, MessageSquare, Heart, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PersonalityChangeProps {
  currentPersonality: UserPersonalityType;
  accountCreatedDate: Date; // When user signed up
  hasChangedPersonality: boolean; // Whether they've already used their one change
  onPersonalityChange?: (newPersonality: UserPersonalityType, reason: string) => void;
}

interface ChangeReason {
  category: 'style' | 'guidance' | 'cultural' | 'values' | 'other';
  details: string;
}

type ChangeStep = 'locked' | 'overview' | 'questionnaire' | 'preview' | 'complete';

export const PersonalityChange = ({
  currentPersonality,
  accountCreatedDate,
  hasChangedPersonality,
  onPersonalityChange
}: PersonalityChangeProps) => {
  const [step, setStep] = useState<ChangeStep>('locked');
  const [daysActive, setDaysActive] = useState(0);
  const [changeReason, setChangeReason] = useState<ChangeReason | null>(null);
  const [recommendedPersonality, setRecommendedPersonality] = useState<UserPersonalityType | null>(null);

  const REQUIRED_DAYS = 7;
  const COOLDOWN_HOURS = 24; // 24-hour cooldown after initial assignment

  // Check if 24-hour cooldown has passed
  const checkCooldown = (): boolean => {
    const assignedAtStr = localStorage.getItem('personalityAssignedAt');
    if (!assignedAtStr) {
      // If no timestamp, use account creation date as fallback
      return true; // Allow change if no timestamp exists
    }

    try {
      const assignedAt = new Date(assignedAtStr);
      const now = new Date();
      const hoursSinceAssignment = (now.getTime() - assignedAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceAssignment >= COOLDOWN_HOURS;
    } catch {
      return true; // Allow change if timestamp is invalid
    }
  };

  const canChange = daysActive >= REQUIRED_DAYS && !hasChangedPersonality && checkCooldown();

  // Calculate days active
  useEffect(() => {
    const now = new Date();
    const created = new Date(accountCreatedDate);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    setDaysActive(diffDays);

    // Set initial step based on eligibility
    if (hasChangedPersonality) {
      setStep('complete'); // Already changed
    } else if (diffDays >= REQUIRED_DAYS && checkCooldown()) {
      setStep('overview'); // Eligible to change
    } else {
      setStep('locked'); // Still in trial period or cooldown
    }
  }, [accountCreatedDate, hasChangedPersonality]);

  const handleStartChange = () => {
    setStep('questionnaire');
  };

  const handleQuestionnaireComplete = (reason: ChangeReason, recommended: UserPersonalityType) => {
    setChangeReason(reason);
    setRecommendedPersonality(recommended);
    setStep('preview');
  };

  const handleConfirmChange = () => {
    if (!recommendedPersonality || !changeReason) return;

    const reasonText = `${changeReason.category}: ${changeReason.details}`;
    
    // Call parent handler
    onPersonalityChange?.(recommendedPersonality, reasonText);

    // Show success
    toast.success('Personality changed successfully!', {
      description: `Welcome to ${USER_PERSONALITIES[recommendedPersonality].name}`
    });

    setStep('complete');
  };

  const currentPersonalityInfo = USER_PERSONALITIES[currentPersonality];
  const daysRemaining = Math.max(0, REQUIRED_DAYS - daysActive);
  const trialProgress = Math.min(100, (daysActive / REQUIRED_DAYS) * 100);

  // Mock performance metrics (in production, these would come from analytics)
  const performanceMetrics = {
    conversationsStarted: 12,
    helpfulResponses: 34,
    matchesViewed: 8,
    satisfactionScore: 87
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Step 1: Locked (Trial Period) */}
        {step === 'locked' && (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-amber-500/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-lg">Trial Period Active</CardTitle>
                </div>
                <CardDescription>
                  Get to know your MMAgent before making changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Countdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      Day {daysActive} of {REQUIRED_DAYS}
                    </span>
                  </div>
                  <Progress value={trialProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} until you can change personalities
                  </p>
                  
                  {/* 24-hour cooldown check */}
                  {!checkCooldown() && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-1">
                        24-Hour Cooldown Active
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        You can change your personality 24 hours after your initial assignment. This helps ensure you've had time to experience your MMAgent.
                      </p>
                    </div>
                  )}
                </div>

                {/* Why wait? */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Why the wait?</p>
                  <p className="text-xs text-muted-foreground">
                    We want you to experience your MMAgent's full guidance style before deciding to change. 
                    Many users find their personality grows on them over the first week!
                  </p>
                </div>

                {/* Current Personality Performance */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Your {currentPersonalityInfo.name} So Far
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-primary">
                        {performanceMetrics.conversationsStarted}
                      </div>
                      <div className="text-xs text-muted-foreground">Conversations</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-primary">
                        {performanceMetrics.helpfulResponses}
                      </div>
                      <div className="text-xs text-muted-foreground">Helpful Responses</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-primary">
                        {performanceMetrics.matchesViewed}
                      </div>
                      <div className="text-xs text-muted-foreground">Matches Viewed</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-primary">
                        {performanceMetrics.satisfactionScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Overview (Eligible to Change) */}
        {step === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">{currentPersonalityInfo.emoji}</div>
                  <div>
                    <CardTitle className="text-lg">
                      Current: {currentPersonalityInfo.name}
                    </CardTitle>
                    <CardDescription>{currentPersonalityInfo.tagline}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Performance Stats */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Your Performance with {currentPersonalityInfo.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xl font-bold text-foreground">
                          {performanceMetrics.conversationsStarted}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Conversations Started
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xl font-bold text-foreground">
                          {performanceMetrics.satisfactionScore}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Satisfaction Score
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Info */}
                <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Ready to Change?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You've completed the 7-day trial period. You have <strong>one opportunity</strong> to 
                    change your personality if you feel another style would work better for you.
                  </p>
                </div>

                {/* Action */}
                <Button onClick={handleStartChange} className="w-full" size="lg">
                  Start Personality Change
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Questionnaire */}
        {step === 'questionnaire' && (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PersonalityChangeQuestionnaire
              currentPersonality={currentPersonality}
              onComplete={handleQuestionnaireComplete}
              onCancel={() => setStep('overview')}
            />
          </motion.div>
        )}

        {/* Step 4: Preview */}
        {step === 'preview' && recommendedPersonality && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PersonalityPreview
              personality={recommendedPersonality}
              currentPersonality={currentPersonality}
              onConfirm={handleConfirmChange}
              onBack={() => setStep('questionnaire')}
            />
          </motion.div>
        )}

        {/* Step 5: Already Changed (Locked Out) */}
        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Personality Change Complete</CardTitle>
                </div>
                <CardDescription>
                  You've used your one-time personality change
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                  <div className="text-3xl">{currentPersonalityInfo.emoji}</div>
                  <div>
                    <p className="font-medium text-foreground">
                      {currentPersonalityInfo.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentPersonalityInfo.tagline}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      No more changes available
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You've already used your one-time personality change. This helps ensure 
                    meaningful matches based on a stable personality profile. Continue building 
                    your relationship with your MMAgent!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
