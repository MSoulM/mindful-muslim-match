import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonalityAssessment, UserPersonalityType } from '@/components/onboarding/PersonalityAssessment';
import { PersonalityReveal } from '@/components/onboarding/PersonalityReveal';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { toast } from 'sonner';

export default function PersonalityAssessmentDemo() {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);
  const [assignedPersonality, setAssignedPersonality] = useState<UserPersonalityType | null>(null);

  const handleComplete = (personality: UserPersonalityType, scores: Record<UserPersonalityType, number>) => {
    console.log('Assessment complete:', { personality, scores });
    setAssignedPersonality(personality);
    setIsComplete(true);
  };

  const handleContinue = () => {
    toast.success('Personality confirmed!', {
      description: 'Your MMAgent is ready to guide you'
    });
    setTimeout(() => {
      navigate('/profile');
    }, 1000);
  };

  const handleTryDifferent = () => {
    setIsComplete(false);
    setAssignedPersonality(null);
    toast.info('Let\'s reassess your personality');
  };

  const handleSkip = () => {
    toast.info('Assessment skipped', {
      description: 'You can complete this later in settings'
    });
    navigate('/profile');
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Personality Assessment"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-primary/5 to-transparent">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Discover Your Personality
          </h1>
          <p className="text-muted-foreground">
            Help us understand you better with 5 quick questions
          </p>
        </div>

        {/* Assessment or Reveal */}
        <div className="flex-1 overflow-y-auto">
          {!isComplete ? (
            <PersonalityAssessment
              onComplete={handleComplete}
              onSkip={handleSkip}
              allowVoice={true}
            />
          ) : assignedPersonality ? (
            <PersonalityReveal
              personality={assignedPersonality}
              onContinue={handleContinue}
              onTryDifferent={handleTryDifferent}
            />
          ) : null}
        </div>

        {/* Footer tip */}
        {!isComplete && (
          <div className="p-4 bg-muted/30 border-t">
            <p className="text-xs text-center text-muted-foreground">
              💡 Your responses help us match you with compatible partners
            </p>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
