import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceRegistration } from '@/components/onboarding/VoiceRegistration';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ProgressBar } from '@/components/ui/Feedback/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toast } from '@/components/ui/Feedback/Toast';
import { Skeleton } from '@/components/ui/Feedback/Skeleton';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { toast } from 'sonner';
import { VOICE_ONBOARDING_QUESTIONS } from '@/config/onboardingConstants';

export default function VoiceOnboardingDemo() {
  const navigate = useNavigate();
  const { isGold, isLoading: isSubscriptionLoading } = useSubscriptionTier();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [paywallToast, setPaywallToast] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
  }>({
    isOpen: false,
    type: 'warning',
    title: ''
  });

  // Show warning toast when free tier user accesses voice onboarding
  useEffect(() => {
    if (!isSubscriptionLoading && !isGold) {
      setPaywallToast({
        isOpen: true,
        type: 'warning',
        title: 'Subscribe to Gold to record your voice',
        description: 'Upgrade to Gold to record your voice introduction and enhance your profile.'
      });
    }
  }, [isGold, isSubscriptionLoading]);

  const handleComplete = (transcript: string) => {
    const newResponses = [...responses, transcript];
    setResponses(newResponses);

    toast.success('Response recorded!', {
      description: `${transcript.split(/\s+/).length} words captured`
    });

    if (step < VOICE_ONBOARDING_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // All questions complete
      toast.success('Voice onboarding complete!', {
        description: 'Your profile has been created from your voice responses'
      });
      
      // Navigate back or to next screen
      setTimeout(() => navigate('/profile'), 2000);
    }
  };

  const currentQuestion = VOICE_ONBOARDING_QUESTIONS[step];

  // Show loading state while checking subscription
  if (isSubscriptionLoading) {
    return (
      <ScreenContainer>
        <TopBar 
          variant="back"
          title="Voice Onboarding"
          onBackClick={() => navigate(-1)}
        />
        <div className="flex-1 flex flex-col p-4">
          <div className="space-y-4">
            <Skeleton variant="rect" height={400} className="rounded-2xl" />
          </div>
        </div>
      </ScreenContainer>
    );
  }

  // Show paywall message for free tier users
  if (!isGold) {
    return (
      <ScreenContainer>
        <TopBar 
          variant="back"
          title="Voice Onboarding"
          onBackClick={() => navigate(-1)}
        />
        <div className="flex-1 flex flex-col p-4">
          <EmptyState
            icon="🎤"
            title="Subscribe to Gold to record your voice"
            description="Record your voice introduction to help matches hear your warmth and sincerity. Upgrade to Gold to unlock voice recording and other premium features."
            action={{
              label: "Upgrade to Gold",
              onClick: () => {
                navigate('/premium');
              }
            }}
          />
        </div>

        {/* Paywall Toast */}
        <Toast
          type={paywallToast.type}
          title={paywallToast.title}
          description={paywallToast.description}
          isOpen={paywallToast.isOpen}
          onClose={() => setPaywallToast(prev => ({ ...prev, isOpen: false }))}
          duration={5000}
          position="top-right"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Voice Onboarding"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 flex flex-col p-4">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {step + 1} of {VOICE_ONBOARDING_QUESTIONS.length}
            </span>
            <span className="text-sm font-medium">
              {Math.round(((step) / VOICE_ONBOARDING_QUESTIONS.length) * 100)}% Complete
            </span>
          </div>
          <ProgressBar value={((step) / VOICE_ONBOARDING_QUESTIONS.length) * 100} showPercentage={false} />
        </div>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground mb-6 text-center">
          {currentQuestion.subtitle}
        </p>

        {/* Voice registration component */}
        <VoiceRegistration
          prompt={currentQuestion.prompt}
          minWords={currentQuestion.minWords}
          onComplete={handleComplete}
        />

        {/* Tips */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">💡 Tips for better results:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Speak clearly in a quiet environment</li>
            <li>• Take your time - pause if needed</li>
            <li>• Use "Undo Last" to remove mistakes</li>
            <li>• Switch to typing if voice isn't working</li>
          </ul>
        </div>
      </div>
    </ScreenContainer>
  );
}
