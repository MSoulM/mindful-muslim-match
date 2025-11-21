import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceRegistration } from '@/components/onboarding/VoiceRegistration';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { toast } from 'sonner';

export default function VoiceOnboardingDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);

  const questions = [
    {
      prompt: "Tell us about yourself",
      subtitle: "Share what makes you unique",
      minWords: 10
    },
    {
      prompt: "What are your values and beliefs?",
      subtitle: "What matters most to you in life?",
      minWords: 15
    },
    {
      prompt: "Describe your ideal relationship",
      subtitle: "What does your perfect partnership look like?",
      minWords: 20
    }
  ];

  const handleComplete = (transcript: string) => {
    const newResponses = [...responses, transcript];
    setResponses(newResponses);

    toast.success('Response recorded!', {
      description: `${transcript.split(/\s+/).length} words captured`
    });

    if (step < questions.length - 1) {
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

  const currentQuestion = questions[step];

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
              Question {step + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium">
              {Math.round(((step) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((step) / questions.length) * 100}%` }}
            />
          </div>
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
